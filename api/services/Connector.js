/* global sails */
"use strict";

var request = require('request-promise');
var _ = require('lodash');
var Promise = require("bluebird");

module.exports = {
    attributes: {},
    getDocuments: function (ResearchEntityModel, researchEntityId, query, skipCopiedCheck) {
        var self = this;
        var connector = query.where.connector;
        if (!connector)
            throw new Error('A Connector parameter is necessary');
        return ResearchEntityModel.findOneById(researchEntityId)
            .then(function (researchEntity) {
                var reqConfig;
                switch (connector) {
                    case'Publications':
                        reqConfig = self.getPublicationsConfig(researchEntity, query);
                        break;
                    case'ORCID':
                        reqConfig = self.getOrcidConfig(researchEntity, query);
                        break;
                    case'Scopus':
                        reqConfig = self.getScopusConfig(researchEntity, query);
                        break;
                    default:
                    //sTODO: error management
                }

                return self.makeRequest(reqConfig)
                    .then(res => {
                        /*if (!skipCopiedCheck)
                         return ResearchEntityModel.checkCopiedDocuments(ResearchEntityModel, researchEntityId, res.items)
                         .then(documents => ({items: documents, count: res.count}));*/

                        return res;
                    });
            });
    },
    makeRequest: function (reqConfig) {
        return request.get(reqConfig.reqParams)
            .then(res => {
                const extracted = reqConfig.fieldExtract(res);
                return Promise.all(_.map(extracted.documents, r => reqConfig.transform(r)))
                    .then(documents => ({
                        items: documents,
                        count: extracted.count
                    }));
            });
    },
    getPublicationsConfig: function (researchEntity, configQuery) {
        var researchEntityType = researchEntity.getType();
        var query;
        if (researchEntityType === 'user') {
            var opts = {
                'username': {'author-email': researchEntity.username},
                'surname': {author: researchEntity.surname}
            };

            if (configQuery.where.field in opts)
                query = opts[configQuery.where.field];
            else
                throw "ExternalDocument error: field not selected";
        }
        else {
            query = {"research-structure": researchEntity.publicationsAcronym};
        }

        var qs = {
            limit: configQuery.limit,
            skip: configQuery.skip
        };
        qs = _.merge(qs, query);

        return {
            reqParams: {
                uri: 'http://backend.publications.iit.it/api/publications/getMatchingOnesAsJsonData',
                qs: qs,
                json: true
            },
            fieldExtract: res =>({
                documents: _.get(res, 'data'),
                count: _.get(res, 'items_count')
            }),
            transform: d => {
                var newDoc = {
                    title: d.title,
                    authorsStr: d.authors.replace(/\*/g, ''),
                    year: d.year,
                    doi: d.doi,
                    volume: d.volume,
                    issue: d.issue,
                    pages: /^\d+-\d+$/.test(d.pages) ? d.pages : '',
                    articleNumber: ''
                };
                if (d.conference)
                    newDoc.sourceType = 'conference';
                else if (d.journal)
                    newDoc.sourceType = 'journal';
                else if (d.bookTitle)
                    newDoc.sourceType = 'book';
                else
                    newDoc.sourceType = null;
                var typeMappings = {
                    bookwhole: 'book',
                    bookchapter: 'bookChapter',
                    fullpapervolumeatreferredconference: 'conference_paper',
                    shortpaperabstractatrefereedconference: 'abstract',
                    nationaljournal: 'article',
                    internationaljournal: 'article',
                    correction: 'erraturm',
                    editorial: 'editorial',
                    supplementaryinformation: 'note'
                };
                newDoc.type = d.typeAlias in typeMappings ? typeMappings[d.typeAlias] : null;

                var newSource = {
                    title: d.journal || d.conference || d.bookTitle,
                    publisher: d.publisher,
                    acronym: d.conferenceAcronym,
                    location: d.conferencePlace
                };
                return mergeDocAndSource(newDoc, newSource);
            }
        };
    },
    getOrcidConfig: function (researchEntity, configQuery) {
        return {
            reqParams: {
                uri: 'http://pub.orcid.org/' + researchEntity.orcidId + '/orcid-works',
                headers: {
                    'Accept': 'application/json'
                },
                /*Pagination does not work in this way*/
                qs: {
                    limit: configQuery.limit,
                    skip: configQuery.skip
                },
                json: true

            },
            fieldExtract: res => {
                /* Fake pagination: To be fixed */
                const allDocuments = _.get(res, 'orcid-profile.orcid-activities.orcid-works.orcid-work');
                const sortedDocuments = _.orderBy(allDocuments, ['publication-date.year.value'], ['desc']);
                const documents = _.slice(sortedDocuments, configQuery.skip, configQuery.skip + configQuery.limit);
                const count = allDocuments.length;
                return {documents, count};
            },
            transform: d => {
                function getAttributeFromCitation(d, attribute) {
                    const citationData = _.get(d, 'work-citation.citation', '');
                    const regex = new RegExp(attribute + '\\s=\\s{(.*?)}');
                    return _.get(citationData.match(regex), '[1]');
                }

                function getExternalId(d, attributeName) {
                    return _.get(
                        _.find(_.get(d, 'work-external-identifiers.work-external-identifier'),
                            function (wei) {
                                return wei['work-external-identifier-type'] === attributeName;
                            }),
                        'work-external-identifier-id.value'
                    );
                }

                const sourceTypeMappings = {
                    JOURNAL_ARTICLE: 'journal',
                    CONFERENCE_PAPER: 'conference',
                    BOOK: 'book'
                };
                const sourceType = sourceTypeMappings[d['work-type']];
                const newDoc = {
                    title: _.get(d, 'work-title.title.value'),
                    authorsStr: _.map(_.get(d, 'work-contributors.contributor'), function (c) {
                        var authorStr = _.get(c, 'credit-name.value');
                        return authorStr.replace(/,/g, '');
                    }).join(', '),
                    year: _.get(d, 'publication-date.year.value'),
                    volume: getAttributeFromCitation(d, 'volume'),
                    issue: getAttributeFromCitation(d, 'number'),
                    pages: getAttributeFromCitation(d, 'pages'),
                    doi: getExternalId(d, 'DOI'),
                    scopusId: _.trimStart(getExternalId(d, 'EID'), '2-s2.0-'),
                    wodId: _.trimStart(getExternalId(d, 'OTHER_ID'), 'WOS:'),
                    sourceType: sourceType
                };
                const newSource = {
                    type: sourceType,
                    title: getAttributeFromCitation(d, 'journal') || _.get(d, 'journal-title.value'),
                    issn: getExternalId(d, 'ISSN'),
                    isbn: getExternalId(d, 'ISBN'),
                };

                return mergeDocAndSource(newDoc, newSource);
            }
        };
    },
    getScopusConfig: function (researchEntity, configQuery) {
        var researchEntityType = researchEntity.getType();
        var uri = 'https://api.elsevier.com/content/search/scopus';
        var query = [];

        if (researchEntityType === 'user') {

            var opts = {
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

        var additionalOpts = {
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

                if (error)
                    throw new Error(error);

                const count = _.get(res, 'search-results.opensearch:totalResults');
                const documents = _.get(res, 'search-results.entry');
                return {documents, count};
            },
            transform: scopusTransform
        };
    }
};

function getConferenceLocation(d) {
    var venuePath = 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.conflocation.venue';
    var cityPath = 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.conflocation.city';
    var venue = _.get(d, venuePath);
    var city = _.get(d, cityPath);
    var conferenceLocationArray = _.compact([venue, city]);
    var conferenceLocation = conferenceLocationArray.join(', ');
    return conferenceLocation;
}

function getConferenceAcronym(d) {
    var confinfo = _.get(d, 'item.bibrecord.head.source.additional-srcinfo.conferenceinfo.confevent.confname');
    var confAcronym = _.isNil(confinfo) ? "" : confinfo.split(', ')[1];
    return confAcronym;
}

function getScopusId(d) {
    var identifier = d['dc:identifier'];
    if (_.startsWith(identifier, 'SCOPUS_ID:')) {
        return _.replace(identifier, 'SCOPUS_ID:', '');
    }
    var eid = d['eid'];
    if (_.startsWith(eid, '2-s2.0-')) {
        return _.trimStart(eid, '2-s2.0-');
    }
    return null;
}

function scopusTransform(d1) {
    var scopusId = getScopusId(d1);
    return makeRequest(d1, 0)
        .then(generateDocument)
        .catch(err => {
            if (err.retry) {
                sails.log.debug(err.message);
                return scopusTransform(d1);
            }

            sails.log.debug('Document failed. Scopus Id = ' + scopusId);
            sails.log.debug(err);

            return {};
        });


    function makeRequest(d1, attempt) {
        return request
            .get({
                uri: 'https://api.elsevier.com/content/abstract/scopus_id/' + scopusId,
                headers: {
                    'X-ELS-APIKey': sails.config.scientilla.scopus.apiKey,
                    'X-ELS-Insttoken': sails.config.scientilla.scopus.token,
                    Accept: 'application/json'
                },
                json: true
            })
            .catch(err => {
                if (attempt < 3) {
                    sails.log.debug('Error: Scopus Id: ' + scopusId + ', trying again, attempt n. ' + (attempt + 1));
                    return makeRequest(d1, attempt + 1);
                }

                sails.log.debug('Scopus request failed. Scopus Id = ' + scopusId);

                return {error: err.error};
            });
    }

    function generateDocument(res) {
        const scopusId = getScopusId(d1);

        if (_.has(res, 'error'))
            throw res.error;

        function getConditionalField(obj, path, type) {
            const vals = toArray(_.get(obj, path));
            return _.get(_.find(vals, {'@type': type}), '$');
        }

        const d2 = _.get(res, 'abstracts-retrieval-response', {});
        const scopusSource = _.get(d2, 'item.bibrecord.head.source');

        const sourceTypeMappings = {
            'j': 'journal',
            'p': 'conference',
            'b': 'book',
            'r': 'report',
            'k': 'bookseries'
        };

        var typeMappings = {
            ar: 'article',
            ab: 'abstract_report',
            ip: 'article_in_press',
            bk: 'book',
            ch: 'book_chapter',
            cp: 'conference_paper',
            cr: 'conference_review',
            ed: 'editorial',
            er: 'erratum',
            le: 'letter',
            no: 'note',
            re: 'review',
            sh: 'short_survey'
        };

        var sourceType = sourceTypeMappings[getDollars(scopusSource, '@type')];
        var documentData = {
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

        if (_.isEmpty(documentData.authorsStr)) {
            throw {
                message: 'Document field missing',
                retry: true,
                scopusId: scopusId
            };
        }


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
            throw {
                message: 'Affiliation field missing',
                retry: true,
                scopusId: scopusId
            };

        const institutesCreationFns = _.map(
            scopusInstitutes,
            i => Institute.findOrCreate({scopusId: i.scopusId}, i)
        );

        return Promise.all([
            Source.findOrCreate({scopusId: sourceData.scopusId}, sourceData),
            Promise.all(institutesCreationFns)
        ])
            .spread((newSource, newInstitutes) => [d2, documentData, newInstitutes, newSource])
            .spread(function (d2, newDoc, newInstitutes, newSource) {
                const scopusAuthorships = _.get(d2, 'authors.author');

                const correspondingAuthorIndexedName = _.get(d2, 'item.bibrecord.head.correspondence.person.ce:indexed-name');
                const correspondingIndex = _.findIndex(newDoc.authorsStr.split(', '), correspondingAuthorIndexedName);
                newDoc.authorships = _.map(scopusAuthorships, (a, i) => {
                    const affiliationArray = toArray(a.affiliation);
                    const affiliationInstitutes = _.map(
                        affiliationArray,
                        aff => _.find(newInstitutes, {scopusId: aff['@id']}).id
                    );

                    return {
                        position: i,
                        corresponding: correspondingIndex === i,
                        affiliations: affiliationInstitutes
                    };
                });
                newDoc.source = newSource;
                return newDoc;
            })
    }


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

function mergeDocAndSource(newDoc, newSource) {
    if (!newSource.title)
        return newDoc;
    return Source.findOneByTitle(newSource.title)
        .then(source => {
            newDoc.source = source ? source : newSource;
            return newDoc;
        });
}