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
            transform: function (r) {
                return {
                    title: r.title,
                    authors: r.authors.replace(/\*/g, '')
                };
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
            transform: function (r) {
                return {
                    title: _.get(r, 'work-title.title.value'),
                    authors: _.map(_.get(r, 'work-contributors.contributor'), function (c) {
                        var authorStr = _.get(c, 'credit-name.value');
                        return authorStr.replace(/,/g, '');
                    }).join(', ')
                };
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
            //query = 'AF-ID(7004326697)';
            uri += 'affiliation';
        }

        //if()

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