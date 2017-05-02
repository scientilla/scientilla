/* global sails */
"use strict";

const request = require('request-promise');
const _ = require('lodash');
const Promise = require("bluebird");
const SourceTypes = require("./SourceTypes");
const DocumentTypes = require("./DocumentTypes");

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
                        if (!skipCopiedCheck)
                            return ResearchEntityModel.checkCopiedDocuments(ResearchEntityModel, researchEntityId, res.items, true)
                                .then(documents => ({items: documents, count: res.count}));

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
        const researchEntityType = researchEntity.getType();
        let query;
        if (researchEntityType === 'user') {
            const opts = {
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

        if (configQuery.where.type && configQuery.where.type !== "all")
            query = _.merge({type: configQuery.where.type}, query);

        let qs = {
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
            fieldExtract: res => ({
                documents: _.get(res, 'data'),
                count: _.get(res, 'items_count')
            }),
            transform: d => {
                let sourceType;
                if (d.conference)
                    sourceType = SourceTypes.CONFERENCE;
                else if (d.journal)
                    sourceType = SourceTypes.JOURNAL;
                else if (d.bookTitle)
                    sourceType = SourceTypes.BOOK;
                else
                    sourceType = null;

                const typeMappings = {
                    bookwhole: DocumentTypes.BOOK,
                    bookchapter: DocumentTypes.BOOK_CHAPTER,
                    fullpapervolumeatreferredconference: DocumentTypes.CONFERENCE_PAPER,
                    shortpaperabstractatrefereedconference: DocumentTypes.ABSTRACT_REPORT,
                    nationaljournal: DocumentTypes.ARTICLE,
                    internationaljournal: DocumentTypes.ARTICLE,
                    correction: DocumentTypes.ERRATUM,
                    editorial: DocumentTypes.EDITORIAL,
                    supplementaryinformation: DocumentTypes.NOTE,
                    talk: DocumentTypes.INVITED_TALK
                };
                const documentType = d.typeAlias in typeMappings ? typeMappings[d.typeAlias] : null;
                var newDoc = {
                    title: d.title,
                    authorsStr: d.authors.replace(/\*/g, ''),
                    year: d.year,
                    doi: d.doi,
                    volume: d.volume,
                    issue: d.issue,
                    pages: /^\d+-\d+$/.test(d.pages) ? d.pages : '',
                    articleNumber: '',
                    sourceType: sourceType,
                    type: documentType
                };

                //TODO accrocchio mainInstituteId assumed equal 1
                const mainInstituteId = 1;
                newDoc.authorships = d.authors.split(',').map((author, i) => {
                        const affiliations = author.includes('*') ? [mainInstituteId] : [];
                        return {
                            position: i,
                            corresponding: false,
                            affiliations: affiliations
                        }
                    }
                );

                if (documentType == DocumentTypes.INVITED_TALK) {
                    newDoc.itSource = d.publication;
                    return newDoc;
                }

                const newSource = {
                    title: d.journal || d.conference || d.bookTitle,
                    publisher: d.publisher,
                    acronym: d.conferenceAcronym,
                    location: d.conferencePlace,
                    type: sourceType
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
                    JOURNAL_ARTICLE: SourceTypes.JOURNAL,
                    CONFERENCE_PAPER: SourceTypes.CONFERENCE,
                    BOOK: SourceTypes.BOOK
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
        var uri = sails.config.scientilla.scopus.url + '/content/search/scopus';
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

function scoupsSingleRequest(d1, attempt) {
    var scopusId = getScopusId(d1);
    return request
        .get({
            uri: sails.config.scientilla.scopus.url + '/content/abstract/scopus_id/' + scopusId,
            headers: {
                'X-ELS-APIKey': sails.config.scientilla.scopus.apiKey,
                'X-ELS-Insttoken': sails.config.scientilla.scopus.token,
                Accept: 'application/json'
            },
            json: true
        })
        .catch(function (err) {
            if (attempt < 3) {
                sails.log.debug('Error: Scopus Id: ' + scopusId + ', trying again, attempt n. ' + (attempt + 1));
                return scoupsSingleRequest(d1, attempt + 1);
            }

            sails.log.debug('Scopus request failed. Scopus Id = ' + scopusId);
            sails.log.debug(err.error);

            return {};
        })
        .then(function (res) {
            function getConditionalField(obj, path, type) {
                const vals = toArray(_.get(obj, path));
                return _.get(_.find(vals, {'@type': type}), '$');
            }

            const d2 = _.get(res, 'abstracts-retrieval-response', {});
            if (_.isEmpty(d2))
                throw {
                    error: 'empty document ' + scopusId,
                    retry: false,
                    d1: res,
                    scopusId: scopusId
                };

            const scopusSource = _.get(d2, 'item.bibrecord.head.source');

            const sourceTypeMappings = {
                'd': SourceTypes.JOURNAL, //trade journal
                'j': SourceTypes.JOURNAL,
                'p': SourceTypes.CONFERENCE,
                'b': SourceTypes.BOOK,
                'r': SourceTypes.JOURNAL, // report
                'k': SourceTypes.BOOKSERIES
            };

            var typeMappings = {
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

            if (_.isEmpty(documentData.authorsStr))
                throw {
                    error: 'Document field missing ' + scopusId,
                    retry: true,
                    d1: d1,
                    scopusId: scopusId
                };


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
                    error: 'Affiliation field missing',
                    retry: true,
                    d1: d1,
                    scopusId: scopusId
                };

            const institutesCreationFns = _.map(
                scopusInstitutes,
                i => Institute.findOrCreateRealInstitute(i)
            );

            return Promise.all([
                Source.findOrCreate({scopusId: sourceData.scopusId}, sourceData),
                Promise.all(institutesCreationFns)
            ])
                .spread((newSource, newInstitutes) => [d2, documentData, newInstitutes, newSource]);
        })
        .spread(function (d2, newDoc, newInstitutes, newSource) {
            const scopusAuthorships = _.get(d2, 'authors.author');
            const scopusAuthorGroups = toArray(_.get(d2, 'item.bibrecord.head.author-group'));
            const scopusAuthors = _.flatMap(scopusAuthorGroups, 'author');

            newDoc.authorships = _.map(scopusAuthorships, (a, i) => {
                const affiliationArray = toArray(a.affiliation);
                const affiliationInstitutes = _.map(
                    affiliationArray,
                    aff => _.find(newInstitutes, {scopusId: aff['@id']}).id
                );
                const author = _.find(scopusAuthors, {'@auid': a['@auid']});
                const corresponding = !!author['ce:e-address'];

                return {
                    position: i,
                    corresponding: corresponding,
                    affiliations: affiliationInstitutes
                };
            });
            newDoc.institutes = newInstitutes;
            newDoc.source = newSource;
            return newDoc;
        })
        .catch(function (err) {
            if (err.retry) {
                sails.log.debug(err.error);
                return scoupsSingleRequest(err.d1, 0);
            }

            sails.log.debug('Document failed. Scopus Id = ' + scopusId);
            sails.log.debug(err);

            return {};
        });
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