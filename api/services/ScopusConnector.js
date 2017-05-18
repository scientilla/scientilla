/* global sails,Source,Institute */
"use strict";

const request = require('requestretry');
const _ = require('lodash');
const Promise = require("bluebird");
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

module.exports = {
    getConfig: function (researchEntity, configQuery) {
        const researchEntityType = researchEntity.getType();
        let uri = sails.config.scientilla.scopus.url + '/content/search/scopus';
        let query = [];

        if (researchEntityType === 'user') {
            const opts = {
                'surname': 'AUTHNAME(' + researchEntity.surname + ')',
                'scopusId': 'au-id(' + researchEntity.scopusId + ')'
            };

            if (configQuery.where.field in opts)
                query.push(opts[configQuery.where.field]);
            else
                throw "ExternalDocument error: field not selected";
        }
        else {
            query.push('AF-ID(' + researchEntity.scopusId + ')');
            uri += 'affiliation';
        }

        const additionalOpts = {
            'year': 'PUBYEAR IS %val'
        };

        if (Array.isArray(configQuery.where.additionalFields))
            query = query.concat(
                configQuery.where.additionalFields
                    .map(f => additionalOpts[f.field].replace(/%val/, f.value))
            );

        return {
            reqParams: {
                uri: uri,
                headers: {
                    'X-ELS-APIKey': sails.config.scientilla.scopus.apiKey,
                    'X-ELS-Insttoken': sails.config.scientilla.scopus.token,
                },
                qs: {
                    start: configQuery.skip,
                    count: configQuery.limit,
                    query: query.join(' AND '),
                    sort: '-pubyear'
                },
                json: true
            },
            fieldExtract: res => {
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
            },
            transform: d1 => {
                return scoupsSingleRequest(d1, 0);
            }
        };
    }
};

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

async function scoupsSingleRequest(d1, attempt) {
    let res, documentData;
    const scopusId = getScopusId(d1);
    const requestParams = {
        uri: sails.config.scientilla.scopus.url + '/content/abstract/scopus_id/' + scopusId,
        headers: {
            'X-ELS-APIKey': sails.config.scientilla.scopus.apiKey,
            'X-ELS-Insttoken': sails.config.scientilla.scopus.token,
            Accept: 'application/json'
        },
        json: true,
        fullResponse: true,
        maxAttempts: 5,
        retryDelay: 500
    };

    try {
        res = await request.get(requestParams);
    } catch (err) {
        sails.log.debug('Scopus request failed. Scopus Id = ' + scopusId);
        sails.log.debug(err.error);
        return {};
    }

    function getConditionalField(obj, path, type) {
        const vals = toArray(_.get(obj, path));
        return _.get(_.find(vals, {'@type': type}), '$');
    }

    try {

        const body = res.body;

        if (_.get(body, 'service-error'))
            onError({
                message: _.get(body, 'service-error.status.statusCode'),
                res: body
            }, d1, 3);

        const d2 = _.get(body, 'abstracts-retrieval-response', {});

        if (_.isEmpty(d2))
            onError({
                message: 'Empty document',
                res: body
            }, d1, 3);

        const scopusSource = _.get(d2, 'item.bibrecord.head.source');

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
        documentData = {
            title: _.get(d1, 'dc:title'),
            authorsStr: _.map(
                _.get(d2, 'authors.author'),
                function (c) {
                    return _.get(c, 'ce:indexed-name');
                }).join(', '),
            authorKeywords: _.map(
                _.get(d2, 'authkeywords.author-keyword'),
                function (c) {
                    return _.get(c, '$');
                }).join(', '),
            year: _.get(d2, 'item.bibrecord.head.source.publicationdate.year'),
            doi: _.get(d2, 'coredata.prism:doi'),
            sourceType: sourceType,
            scopusId: scopusId,
            abstract: _.trim(_.get(d2, 'coredata.dc:description')),
            articleNumber: _.get(d2, 'item.bibrecord.head.source.article-number'),
            journal: d1['prism:publicationName'],
            volume: d1['prism:volume'],
            issue: d1['prism:issueIdentifier'],
            pages: d1['prism:pageRange'],
            type: typeMappings[d1['subtype']]
        };

        if (_.isEmpty(documentData.authorsStr))
            onError('Document field missing', d1, attempt);


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
            location: getConferenceLocation(d2),
            acronym: getConferenceAcronym(d2)
        };

        const allAffiliations = toArray(d2.affiliation);

        const scopusInstitutes = _.map(allAffiliations, a => ({
            name: a.affilname,
            city: a['affiliation-city'],
            country: a['affiliation-country'],
            scopusId: a['@id']
        }));

        const scopusInstituteError = scopusInstitutes.filter(si => (!si.name || !si.scopusId)).length;
        if (scopusInstituteError)
            onError('Affiliation field missing', d1, attempt);

        const institutesCreationFns = _.map(
            scopusInstitutes,
            i => Institute.findOrCreateRealInstitute(i)
        );


        const arr = await Promise.all([
            Source.findOrCreate({scopusId: sourceData.scopusId}, sourceData),
            Promise.all(institutesCreationFns)
        ]);

        const newSource = arr[0];
        const newInstitutes = arr[1];

        const scopusAuthorships = _.get(d2, 'authors.author');
        const scopusAuthorGroups = toArray(_.get(d2, 'item.bibrecord.head.author-group'));
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
        sails.log.debug('Document failed. Scopus Id = ' + scopusId);
        sails.log.debug(err);

        return {};
    }

    return documentData;
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

function onError(err, d, attempt) {
    if (attempt < 3) {
        sails.log.debug(err);
        return scoupsSingleRequest(d, attempt + 1);
    }

    throw err;
}