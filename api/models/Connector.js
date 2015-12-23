/**
 * Connector.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var request = require('request-promise');
var _ = require('lodash');

module.exports = {
    attributes: {
    },
    getReferences: function (ResearchEntity, researchEntityId, connector) {
        var self = this;
        return ResearchEntity.findOneById(researchEntityId)
                .then(function (researchEntity) {
                    var reqConfig = self.getPublicationsConfig(researchEntity);
                    return self.makeRequest(reqConfig);
                });
    },
    makeRequest: function (reqConfig) {
        return request.get(reqConfig.reqParams)
                .then(function (res) {
                    var references = reqConfig.extractField ? _.get(res, reqConfig.extractField) : res;
                    return _.map(references, function (r) {
                        var newReference = {};
                        reqConfig.transform(r, newReference);
                        return newReference;
                    });
                });
    },
    getPublicationsConfig: function (researchEntity) {
        var uri = 'http://backend.publications.iit.it/api/publications/getMatchingOnesAsJsonData';
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
        var reqParams = {
            uri: uri,
            qs: qs,
            json: true
        };
        var transform = function (r, newReference) {
            newReference.title = r.title;
            newReference.authors = r.authors.replace(/\*/g, '');
        };

        var extractField = 'data';

        return {
            reqParams: reqParams,
            extractField: extractField,
            transform: transform
        };
    }
};