/**
 * Connector.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var request = require('request-promise');
var _ = require('lodash');
var XML = require('pixl-xml');
var Promise = require("bluebird");

module.exports = {
    attributes: {
    },
    getReferences: function (ResearchEntity, researchEntityId, connector) {
        var self = this;
        return ResearchEntity.findOneById(researchEntityId)
                .then(function (researchEntity) {
                    var reqConfig;
                    switch (connector) {
                        case'Publications':
                            reqConfig = self.getPublicationsConfig(researchEntity);
                            break;
                        case'ORCID':
                            reqConfig = self.getOrcidConfig(researchEntity);
                            break;
                        case'Scopus':
                            reqConfig = self.getScopusConfig(researchEntity);
                            break;
                        default:
                            //sTODO: error management
                    }

                    return self.makeRequest(reqConfig);
                });
    },
    makeRequest: function (reqConfig) {

        return request.get(reqConfig.reqParams)
                .then(function (res) {
                    var references = reqConfig.fieldExtract(res);

                    return Promise.all(_.map(references, function (r) {
                        return reqConfig.transform(r);
                    }));
                });
    },
    getPublicationsConfig: function (researchEntity) {
        var researchEntityType = researchEntity.getType();
        var query;
        if (researchEntityType === 'user') {
            query = {author: researchEntity.surname};
        } else {
            query = {"research-structure": researchEntity.publicationsAcronym};
        }
        var qs = {
            "page-size": 10,
            "page-number": 1
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
                    authors: d.authors.replace(/\*/g, ''),
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
    getOrcidConfig: function (researchEntity) {

        return {
            reqParams: {
                uri: 'http://pub.orcid.org/' + researchEntity.orcidId + '/orcid-works',
                headers: {
                    'Accept': 'application/json'
                },
                qs: {
                    "page-size": 10,
                    "page-number": 1
                },
                json: true

            },
            fieldExtract: function (res) {
                return _.get(res, 'orcid-profile.orcid-activities.orcid-works.orcid-work');
            },
            transform: function (d) {
               function  getAttributeFromCitation(d, attribute){
                   var citationData = _.get(d, 'work-citation.citation');
                   var regex = new RegExp(attribute + '\\s=\\s{(.*?)}');
                   return _.get(citationData.match(regex), '[1]');
               }
                var sourceTypeMappings = {
                    JOURNAL_ARTICLE: 'journal',
                    CONFERENCE_PAPER: 'conference',
                    BOOK: 'book'
                };
                var sourceType = sourceTypeMappings[d['work-type']];
                var newDoc = {
                    title: _.get(d, 'work-title.title.value'),
                    authors: _.map(_.get(d, 'work-contributors.contributor'), function (c) {
                        var authorStr = _.get(c, 'credit-name.value');
                        return authorStr.replace(/,/g, '');
                    }).join(', '),
                    year: _.get(d, 'publication-date.year.value'),
                    doi: _.get(
                            _.get(d, 'work-external-identifiers.work-external-identifier')
                            .find(function(wei) {
                                return wei['work-external-identifier-type'] === 'DOI';
                            }), 
                            'work-external-identifier-id.value'
                        ),
                    sourceType: sourceType    
                };
                switch(newDoc.sourceType) {
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
    getScopusConfig: function (researchEntity) {

        var researchEntityType = researchEntity.getType();
        var uri = 'https://api.elsevier.com/content/search/scopus';
        var query = '';

        if (researchEntityType === 'user') {
            query = 'au-id(' + researchEntity.scopusId + ')';
        } else {
            query = 'AF-ID(' + researchEntity.scopusId + ')';
            uri += 'affiliation';
        }

        return {
            reqParams: {
                uri: uri,
                headers: {
                    'X-ELS-APIKey': 'c3afacc73d9bbfb5c50c58a4a58e07cc',
                    'X-ELS-Insttoken': 'ed64a720836a40cee4e3bf99ee066c67'
                },
                qs: {
                    'page-size': 10,
                    'page-number': 1,
                    query: query
                },
                json: true
            },
            fieldExtract: function (res) {
                var error = _.get(res, 'search-results.entry[0].error');

                if (error)
                    throw new Error(error);

                return _.get(res, 'search-results.entry');
            },
            transform: function (r) {
                return request
                        .get({
                            uri: 'http://msapi.scivalanalytics.com/REST',
                            qs: {
                                'clientKey': '8fa985e47a9d6f1bd3bbb75427442f6b',
                                'retrieve': _.get(r, 'eid')
                            }
                        })
                        .then(function (resXML) {

                            if (!resXML)
                                throw new Error("XML empty");

                            res = XML.parse(resXML);

                            return {
                                title: _.get(res, 'xocs:item.item.bibrecord.head.citation-title.titletext._Data'),
                                authors: _.map(
                                        _.get(res, 'xocs:meta.cto:unique-author'),
                                        function (c) {
                                            return _.get(c, 'cto:auth-indexed-name');
                                        }).join(', ')
                            };
                        });

            }
        };
    }
};