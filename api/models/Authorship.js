/**
 * Authorship.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */
const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {

    attributes: {
        researchEntity: {
            model: 'User',
        },
        document: {
            model: 'Document'
        },
        affiliations: {
            collection: 'institute',
            via: 'authorships',
            through: 'affiliation'
        },
        corresponding: 'boolean',
        position: 'integer',
        public: 'boolean'
    },
    getEmpty: function() {
        return {
            corresponding: false,
            affiliations: []
        };
    },
    createDraftAuthorships: function(draftId, draftData){
        const authorshipFields = ['position', 'affiliations', 'corresponding'];
        const authorships = _.map(draftData.authorships, a => _.pick(a, authorshipFields));
        _.forEach(authorships, a => a.document = draftId);
        return Authorship.create(authorships);
    }
});

