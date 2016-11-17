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
        position: 'integer',
        public: 'boolean'
    }
});

