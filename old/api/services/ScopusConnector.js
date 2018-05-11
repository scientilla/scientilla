/* global sails,Source,Institute,Group,User */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require('bluebird');
const XML = require('pixl-xml');
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

const elsevierConfig = sails.config.scientilla.externalConnectors.elsevier;

module.exports = {
    getConfig,
    getDocument: documentDataRequest,
    getDocumentCitations,
    getSingleSearchConfig
};

function getConfig(scopusId, params) {
    const search = {};
    if (params.type === 'author')
        search['au-id'] = scopusId;
    else
        search['af-id'] = scopusId;

    Object.assign(search, params.additionalFields);
    const queryString = getQueryString(search);

    return {
        fieldExtract,
        transform,
        reqParams: getSearchReqParams(queryString, params)
    };
}

function getDocumentCitations(scopusId) {
    const eId = '2-s2.0-' + scopusId;
    return documentCitationsRequest(eId);
}

function getSingleSearchConfig(search) {
    const queryString = getQueryString(search);

    return {
        fieldExtract,
        transform,
        reqParams: getSearchReqParams(queryString, {skip: 0, limit: 1})
    };

}

function getSearchReqParams(queryString, params) {
    return {
        uri: elsevierConfig.scopus.url + '/content/search/scopus',
        headers: {
            'X-ELS-APIKey': elsevierConfig.scopus.apiKey,
            'X-ELS-Insttoken': elsevierConfig.scopus.token,
        },
        qs: {
            start: params.skip,
            count: params.limit,
            query: queryString,
            sort: '-pubyear'
        },
        json: true
    };
}

async function documentDataRequest(scopusId, attempt = 0) {
    let res, documentData;
    const requestParams = getScopusRequestParams('/content/abstract/scopus_id/' + scopusId, {view: 'FULL'});
    try {
        res = await request.get(requestParams);
    } catch (err) {
        sails.log.debug('Scopus data request failed. Scopus Id = ' + scopusId);
        sails.log.debug(err.error);
        return {};
    }

    try {
        const body = res.body;

        if (_.get(body, 'service-error'))
            return onError({
                message: _.get(body, 'service-error.status.statusCode'),
                res: body
            }, scopusId, 3);

        const scopusDocumentData = _.get(body, 'abstracts-retrieval-response', {});

        if (_.isEmpty(scopusDocumentData))
            return onError({
                message: 'Empty document',
                res: body
            }, scopusId, 3);

        const scopusSource = _.get(scopusDocumentData, 'item.bibrecord.head.source');

        const sourceTypeMappings = {
            'd': SourceTypes.JOURNAL, //trade journal
            'j': SourceTypes.JOURNAL,
            'p': SourceTypes.CONFERENCE,
            'b': SourceTypes.BOOK,
            'r': SourceTypes.JOURNAL, // report
            'k': SourceTypes.BOOKSERIES
        };

        const typeMappings = {
            ar: DocumentTypes.ARTICLE,
            ab: DocumentTypes.ABSTRACT_REPORT,
            ip: DocumentTypes.ARTICLE_IN_PRESS,
            bk: DocumentTypes.BOOK,
            ch: DocumentTypes.BOOK_CHAPTER,
            cp: DocumentTypes.CONFERENCE_PAPER,
            cr: DocumentTypes.CONFERENCE_REVIEW,
            ed: DocumentTypes.EDITORIAL,
            er: DocumentTypes.ERRATUM,
            le: DocumentTypes.LETTER,
            no: DocumentTypes.NOTE,
            re: DocumentTypes.REVIEW,
            sh: DocumentTypes.SHORT_SURVEY
        };

        const sourceType = sourceTypeMappings[getDollars(scopusSource, '@type')];
        if (!sourceType)
            return onError('Source type missing', scopusId, attempt);

        documentData = {
            title: _.get(scopusDocumentData, 'coredata.dc:title'),
            authorsStr: _.map(
                _.get(scopusDocumentData, 'authors.author'),
                function (c) {
                    return _.get(c, 'ce:indexed-name');
                }).join(', '),
            authorKeywords: _.map(
                _.get(scopusDocumentData, 'authkeywords.author-keyword'),
                function (c) {
                    return _.get(c, '$');
                }).join(', '),
            year: _.get(scopusDocumentData, 'item.bibrecord.head.source.publicationdate.year'),
            doi: _.get(scopusDocumentData, 'coredata.prism:doi'),
            sourceType: sourceType,
            scopusId: scopusId,
            abstract: _.trim(_.get(scopusDocumentData, 'coredata.dc:description')),
            articleNumber: _.get(scopusDocumentData, 'item.bibrecord.head.source.article-number'),
            journal: _.get(scopusDocumentData, 'coredata.prism:publicationName'),
            volume: _.get(scopusDocumentData, 'coredata.prism:volume'),
            issue: _.get(scopusDocumentData, 'coredata.prism:issueIdentifier'),
            pages: _.get(scopusDocumentData, 'coredata.prism:pageRange'),
            type: typeMappings[_.get(scopusDocumentData, 'item.bibrecord.head.citation-info.citation-type.@code')]
        };

        if (_.isEmpty(documentData.authorsStr))
            return onError('Document field missing', scopusId, attempt);


        const sourceData = {
            type: sourceType,
            scopusId: _.get(scopusSource, '@srcid'),
            title: getDollars(scopusSource, 'sourcetitle'),
            issn: getConditionalField(scopusSource, 'issn', 'print'),
            eissn: getConditionalField(scopusSource, 'issn', 'electronic'),
            isbn: getConditionalField(scopusSource, 'isbn', 'print'),
            publisher: _.get(scopusSource, 'publisher.publishername'),
            year: _.get(scopusSource, 'publicationyear.@first'),
            website: getConditionalField(scopusSource, 'website.ce:e-address', 'email'),
            location: getConferenceLocation(scopusDocumentData),
            acronym: getConferenceAcronym(scopusDocumentData)
        };

        const allAffiliations = toArray(scopusDocumentData.affiliation);

        const scopusInstitutes = _.map(allAffiliations, a => ({
            name: a.affilname,
            city: a['affiliation-city'],
            country: a['affiliation-country'],
            scopusId: a['@id']
        }));

        const scopusInstituteError = scopusInstitutes.filter(si => (!si.name || !si.scopusId)).length;
        if (scopusInstituteError)
            return onError('Affiliation field missing', scopusId, attempt);

        const institutesCreationFns = _.map(
            scopusInstitutes,
            i => Institute.findOrCreateRealInstitute(i)
        );


        const arr = await Promise.all([
            Source.findOrCreate({scopusId: sourceData.scopusId, type: sourceData.type}, sourceData),
            Promise.all(institutesCreationFns)
        ]);

        const newSource = arr[0];
        const newInstitutes = arr[1];

        const scopusAuthorships = _.get(scopusDocumentData, 'authors.author');
        const scopusAuthorGroups = toArray(_.get(scopusDocumentData, 'item.bibrecord.head.author-group'));
        const scopusAuthors = _.flatMap(scopusAuthorGroups, 'author');

        documentData.authorships = _.map(scopusAuthorships, (a, i) => {
            const affiliationArray = toArray(a.affiliation);
            const affiliationInstitutes = _.map(affiliationArray,
                aff => _.find(newInstitutes, {scopusId: aff['@id']})
            );
            const affiliationInstitutesFiltered = _.filter(affiliationInstitutes, aff => !!aff);
            const affiliationInstitutesIds = affiliationInstitutesFiltered.map(aff => aff.id);
            const author = _.find(scopusAuthors, {'@auid': a['@auid']});
            const corresponding = !!author['ce:e-address'];

            return {
                position: i,
                corresponding: corresponding,
                affiliations: affiliationInstitutesIds
            };
        });
        documentData.institutes = newInstitutes;
        documentData.source = newSource;

    } catch (err) {
        sails.log.debug('Document data failed. Scopus Id = ' + scopusId);
        sails.log.debug(err);
        return err;
    }

    return documentData;
}


async function documentCitationsRequest(eId) {
    let res, citations, body;
    const requestParams = getScivalRequestParams('/REST/', {citations: eId});
    try {
        res = await request.get(requestParams);
    } catch (err) {
        sails.log.debug('Scopus citations request failed. eId = ' + eId);
        sails.log.debug(err.error);
        return [];
    }

    try {
        body = res.body;
        citations = formatDocumentCitations(body);
    } catch (err) {
        sails.log.debug('Document citations failed to parse XML. eId = ' + eId);
        sails.log.debug('XML: ' + body);
        sails.log.debug(err);

        return [];
    }
    return citations;
}

function formatDocumentCitations(XMLDocumentCitations) {
    const documentCitations = XML.parse(XMLDocumentCitations);

    if (documentCitations.citeColumnTotalXML.citeCountHeader.grandTotal === '0')
        return [{
            year: (new Date()).getFullYear(),
            value: 0
        }];

    const years = documentCitations.citeColumnTotalXML.citeCountHeader.columnHeading;
    const values = documentCitations.citeColumnTotalXML.citeCountHeader.columnTotal;

    if (_.isArray(years))
        return years.map((y, i) => ({
            year: y,
            value: values[i]
        }));

    return [{
        year: years,
        value: values
    }];
}


function getScopusRequestParams(path, qs) {
    return {
        uri: elsevierConfig.scopus.url + path,
        headers: {
            'X-ELS-APIKey': elsevierConfig.scopus.apiKey,
            'X-ELS-Insttoken': elsevierConfig.scopus.token,
            Accept: 'application/json'
        },
        qs: qs,
        json: true,
        fullResponse: true,
        maxAttempts: 5,
        retryDelay: 500
    };
}


function getScivalRequestParams(path, qs) {
    return {
        uri: elsevierConfig.scival.url + path,
        headers: {},
        qs: _.defaults({
            clientKey: elsevierConfig.scival.clientKey
        }, qs),
        fullResponse: true,
        maxAttempts: 5,
        retryDelay: 500
    };
}


function fieldExtract(res) {
    if (_.get(res, 'service-error'))
        throw new _.get(res, 'service-error.status.statusText');

    const error = _.get(res, 'search-results.entry[0].error');

    if (error) {
        if (error === 'Result set was empty')
            return {count: 0, documents: []};
        else
            throw new Error(error);
    }

    const count = _.get(res, 'search-results.opensearch:totalResults');
    const documents = _.get(res, 'search-results.entry');
    return {documents, count};
}

function transform(d1) {
    return documentDataRequest(getScopusId(d1));
}

function getQueryString(search = {}) {
    if (!_.isObject(search))
        return '';

    const queryParams = {
        'year': 'PUBYEAR IS %val%',
        'doi': 'doi(%val%)',
        'au-id': 'au-id(%val%)',
        'af-id': 'af-id(%val%)'
    };

    const queryArr = Object.keys(search)
        .reduce((query, key) => {
                if (queryParams[key]) {
                    query.push(queryParams[key].replace(/%val%/, search[key]));
                    return query;
                }
                return query;
            },
            []);

    return queryArr.join(' AND ');
}

function getConferenceLocation(d) {
    const venuePath = 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.conflocation.venue';
    const cityPath = 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.conflocation.city';
    const venue = _.get(d, venuePath);
    const city = _.get(d, cityPath);
    const conferenceLocationArray = _.compact([venue, city]);
    return conferenceLocationArray.join(', ');
}

function getConferenceAcronym(d) {
    const confinfo = _.get(d, 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.confname');
    return _.isNil(confinfo) ? "" : confinfo.split(', ')[1];
}

function getScopusId(d) {
    const identifier = d['dc:identifier'];
    if (_.startsWith(identifier, 'SCOPUS_ID:')) {
        return _.replace(identifier, 'SCOPUS_ID:', '');
    }
    const eid = d['eid'];
    if (_.startsWith(eid, '2-s2.0-')) {
        return _.trimStart(eid, '2-s2.0-');
    }
    return null;
}

function getConditionalField(obj, path, type) {
    const vals = toArray(_.get(obj, path));
    return _.get(_.find(vals, {'@type': type}), '$');
}

function getDollars(obj, path) {
    return _.get(obj, path + '.$') || _.get(obj, path);
}

function toArray(val) {
    if (_.isNil(val))
        return [];
    if (!_.isArray(val))
        return [val];
    return val;
}

function onError(err, scopusId, attempt) {
    if (attempt < 3)
        return documentDataRequest(scopusId, attempt + 1);

    throw err;
}