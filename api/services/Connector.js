/* global sails */

var request = require('request-promise');
var _ = require('lodash');
var Promise = require("bluebird");

module.exports = {
    attributes: {},
    getDocuments: function (ResearchEntity, researchEntityId, query) {
        var self = this;
        var connector = query.where.connector;
        if (!connector)
            throw new Error('A Connector parameter is necessary');
        return ResearchEntity.findOneById(researchEntityId)
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
                    .then(function (externalDocuments) {
                        return ResearchEntity.checkCopiedDocuments(ResearchEntity, researchEntityId, externalDocuments);
                    });
            });
    },
    makeRequest: function (reqConfig) {
        return request.get(reqConfig.reqParams)
            .then(function (res) {
                var documents = reqConfig.fieldExtract(res);
                return Promise.all(_.map(documents, function (r) {
                    return reqConfig.transform(r);
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

            if(configQuery.where.field in opts)
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
            fieldExtract: function (res) {
                return _.get(res, 'data');
            },
            transform: function (d) {
                var newDoc = {
                    title: d.title,
                    authorsStr: d.authors.replace(/\*/g, ''),
                    year: d.year,
                    doi: d.doi,
                    journal: d.journal,
                    volume: d.volume,
                    issue: d.issue,
                    pages: /^\d+-\d+$/.test(d.pages) ? d.pages : '',
                    articleNumber: '',
                    bookTitle: d.bookTitle,
                    editor: d.editor,
                    publisher: d.publisher,
                    conferenceName: d.conference,
                    conferenceLocation: d.conferencePlace,
                    acronym: d.conferenceAcronym
                };
                if (newDoc.conferenceName)
                    newDoc.sourceType = 'conference';
                else if (newDoc.journal)
                    newDoc.sourceType = 'journal';
                else if (newDoc.bookTitle)
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
                return newDoc;
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
            fieldExtract: function (res) {
                /* To be fixed */
                var allDocuments = _.get(res, 'orcid-profile.orcid-activities.orcid-works.orcid-work');
                var sortedDocuments = _.orderBy(allDocuments, ['publication-date.year.value'], ['desc']);
                var documentsSubset = _.slice(sortedDocuments, configQuery.skip, configQuery.skip + configQuery.limit);
                return documentsSubset;
            },
            transform: function (d) {
                function getAttributeFromCitation(d, attribute) {
                    var citationData = _.get(d, 'work-citation.citation', '');
                    var regex = new RegExp(attribute + '\\s=\\s{(.*?)}');
                    return _.get(citationData.match(regex), '[1]');
                }

                function getEternalId(d, attributeName) {
                    return _.get(
                        _.find(_.get(d, 'work-external-identifiers.work-external-identifier'),
                            function (wei) {
                                return wei['work-external-identifier-type'] === attributeName;
                            }),
                        'work-external-identifier-id.value'
                    );
                }

                var sourceTypeMappings = {
                    JOURNAL_ARTICLE: 'journal',
                    CONFERENCE_PAPER: 'conference',
                    BOOK: 'book'
                };
                var sourceType = sourceTypeMappings[d['work-type']];
                var newDoc = {
                    title: _.get(d, 'work-title.title.value'),
                    authorsStr: _.map(_.get(d, 'work-contributors.contributor'), function (c) {
                        var authorStr = _.get(c, 'credit-name.value');
                        return authorStr.replace(/,/g, '');
                    }).join(', '),
                    year: _.get(d, 'publication-date.year.value'),
                    doi: getEternalId(d, 'DOI'),
                    scopusId: _.trimStart(getEternalId(d, 'EID'), '2-s2.0-'),
                    sourceType: sourceType
                };
                switch (newDoc.sourceType) {
                    case 'journal':
                        newDoc.journal = getAttributeFromCitation(d, 'journal');
                        newDoc.volume = getAttributeFromCitation(d, 'volume');
                        newDoc.issue = getAttributeFromCitation(d, 'number');
                        newDoc.pages = getAttributeFromCitation(d, 'pages');
                        newDoc.articleNumber = null;
                        break;
                    case 'book':
                        newDoc.bookTitle = getAttributeFromCitation(d, 'journal');
                        newDoc.editor = null;
                        newDoc.publisher = null;
                        break;
                    case 'conference':
                        newDoc.conferenceName = getAttributeFromCitation(d, 'journal');
                        newDoc.conferenceLocation = null;
                        newDoc.acronym = null;
                        break;
                }
                return newDoc;
            }
        };
    },
    getScopusConfig: function (researchEntity, configQuery) {
        var researchEntityType = researchEntity.getType();
        var uri = 'https://api.elsevier.com/content/search/scopus';
        var query = '';

        if (researchEntityType === 'user') {

            var opts = {
                'surname': 'AUTHNAME(' + researchEntity.surname + ')',
                'scopusId': 'au-id(' + researchEntity.scopusId + ')'
            };

            if(configQuery.where.field in opts)
                query = opts[configQuery.where.field];
            else
                throw "ExternalDocument error: field not selected";

        }
        else {
            query = 'AF-ID(' + researchEntity.scopusId + ')';
            uri += 'affiliation';
        }

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
                    query: query,
                    sort: '-pubyear'
                },
                json: true
            },
            fieldExtract: function (res) {
                var error = _.get(res, 'search-results.entry[0].error');

                if (error)
                    throw new Error(error);

                return _.get(res, 'search-results.entry');
            },
            transform: function (d1) {
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
                    var confAcronym = confinfo.split(', ')[1];
                    return confAcronym;
                }

                function getScopusId(d) {
                    var identifier = d1['dc:identifier'];
                    if (_.startsWith(identifier, 'SCOPUS_ID:')) {
                        return _.replace(identifier, 'SCOPUS_ID:', '');
                    }
                    var eid = d['eid'];
                    if (_.startsWith(eid, '2-s2.0-')) {
                        return _.trimStart(eid, '2-s2.0-');
                    }
                    return null;
                }

                var scopusId = getScopusId(d1);
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
                    .catch(function () {
                        sails.log.debug('Scopus request failed. Scopus Id = ' + scopusId);
                        return {};
                    })
                    .then(function (res) {
                        var d2 = _.get(res, 'abstracts-retrieval-response', {});

                        var sourceTypeMappings = {
                            'Journal': 'journal',
                            'Conference Proceeding': 'conference',
                            'Book Series': 'book'
                        };
                        var sourceType = sourceTypeMappings[d1['prism:aggregationType']];
                        var newDoc = {
                            title: _.get(d1, 'dc:title'),
                            authorsStr: _.map(
                                _.get(d2, 'authors.author'),
                                function (c) {
                                    return _.get(c, 'ce:indexed-name');
                                }).join(', '),
                            year: _.get(d2, 'item.bibrecord.head.source.publicationdate.year'),
                            doi: _.get(d2, 'coredata.prism:doi'),
                            sourceType: sourceType,
                            scopusId: scopusId,
                            abstract: _.trim(_.get(d2, 'coredata.dc:description'))
                        };

                        switch (newDoc.sourceType) {
                            case 'journal':
                                newDoc.journal = d1['prism:publicationName'];
                                newDoc.volume = d1['prism:volume'];
                                newDoc.issue = d1['prism:issueIdentifier'];
                                newDoc.pages = d1['prism:pageRange'];
                                newDoc.articleNumber = _.get(d2, 'item.bibrecord.head.source.article-number');
                                break;
                            case 'book':
                                newDoc.pages = d1['prism:pageRange'];
                                newDoc.bookTitle = d1['prism:publicationName'];
                                newDoc.editor = null;
                                newDoc.publisher = _.get(d2, 'item.bibrecord.head.source.publisher.publishername');
                                break;
                            case 'conference':
                                newDoc.conferenceName = d1['prism:publicationName'];
                                newDoc.conferenceLocation = getConferenceLocation(d2);
                                newDoc.acronym = getConferenceAcronym(d2);
                                newDoc.volume = d1['prism:volume'];
                                newDoc.issue = d1['prism:issueIdentifier'];
                                newDoc.pages = d1['prism:pageRange'];
                                newDoc.articleNumber = _.get(d2, 'item.bibrecord.head.source.article-number');
                                break;
                        }

                        var typeMappings = {
                            re: 'review',
                            ip: 'article_in_press',
                            ed: 'editorial',
                            ar: 'article',
                            cp: 'conference_paper',
                            no: 'note'
                        };

                        newDoc.type = typeMappings[d1['subtype']];

                        return newDoc;
                    });
            }
        };
    }
};