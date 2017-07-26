/* global Authorship, Affiliation*/
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
        public: 'boolean',
        synchronize: 'boolean',
        unverify: function () {
            this.researchEntity = null;
            this.synchronize = null;
            return this.savePromise();
        }
    },
    beforeDestroy: async function (criteria, cb) {
        const authorships = await Authorship.find(criteria);
        for (let a of authorships)
            await Affiliation.destroy({authorship: a.id});

        cb();
    },
    getEmpty: function () {
        return {
            synchronize: null,
            corresponding: false,
            affiliations: []
        };
    },
    createEmptyAuthorships: function (docId, docData) {
        const authorshipFields = ['position', 'affiliations', 'corresponding'];
        const authorships = _.map(docData.authorships, a => _.pick(a, authorshipFields));
        _.forEach(authorships, a => a.document = docId);
        return Authorship.create(authorships);
    }
});

