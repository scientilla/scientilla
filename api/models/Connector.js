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
    getReferences: function (ResearchEntity, researchEntityId, source) {
        var self = this;
        return ResearchEntity.findOneById(researchEntityId)
                .then(function (researchEntity) {
                    return self.getPublicationsReferences(researchEntity);
                });
    },
    getPublicationsReferences: function (researchEntity) {
        var uri = 'http://backend.publications.iit.it/api/publications/getMatchingOnesAsJsonData';
        var researchEntityType = researchEntity.getType();
        var query = researchEntityType === 'user' ? {author: researchEntity.surname} : {"research-structure": 'iit'};
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
        
        return request.get(reqParams)
                .then(function (res) {
                    var references = extractField ? res[extractField] : res;
                    return _.map(references, function(r) {
                        var newReference = {};
                        transform(r, newReference);
                        return newReference;
                    });
                });
    }
};