/* global Authorship, Affiliation, Institute*/
"use strict";

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'researchEntity',
    'document',
    'affiliations',
    'position',
    'synchronize',
    'corresponding',
    'public',
    'favorite',
    'first_coauthor',
    'last_coauthor',
    'oral_presentation'
];

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
        public: 'boolean',
        favorite: 'boolean',
        synchronize: 'boolean',
        corresponding: 'boolean',
        first_coauthor: 'boolean',
        last_coauthor: 'boolean',
        oral_presentation: 'boolean',
        unverify: function () {
            this.researchEntity = null;
            this.synchronize = null;
            return this.savePromise();
        }
    },
    beforeDestroy: async function (criteria, cb) {
        if (!criteria || !criteria.where) {
            cb();
            return;
        }

        const authorships = await Authorship.find(criteria);
        for (let a of authorships)
            await Affiliation.destroy({authorship: a.id});

        cb();
    },
    getEmpty: function () {
        return {
            synchronize: null,
            researchEntity: null,
            corresponding: false,
            'public': false,
            favorite: false,
            first_coauthor: false,
            last_coauthor: false,
            oral_presentation: false,
            affiliations: []
        };
    },
    getFields: function () {
        return fields;
    },
    filterFields: function (authorshipData) {
        if (!_.isObject(authorshipData))
            return {};
        const newAuthorship = {};
        fields.forEach(f => newAuthorship[f] = authorshipData[f]);
        return newAuthorship;
    },
    createEmptyAuthorships: async function (doc, authorshipsData) {
        //TODO Add empty authorships generated from authorStr
        if (!_.isArray(authorshipsData))
            return;

        const filteredAuthorshipsData = _.map(authorshipsData, a => _.pick(a, fields));
        filteredAuthorshipsData.forEach(a => a.document = doc.id);
        const authorships = await Authorship.create(filteredAuthorshipsData);

        const affiliations = [];
        for (const authData of authorshipsData)
            if (_.isArray(authData.affiliations))
                for (const aff of authData.affiliations) {
                    const institutes = await Authorship.getFixedCollection(Institute, aff);
                    const auth = authorships.find(a => a.position === authData.position);
                    affiliations.push({
                        document: doc.id,
                        authorship: auth.id,
                        institute: institutes
                    });
                }
        if (affiliations.length)
            await Affiliation.create(affiliations);
    },
    updateAuthorships: async function (doc, authorshipsData) {
        //TODO update authorships instead of delete/insert empty
        //TODO Fix authorship bug on authorStr changes
        await Authorship.destroy({document: doc.id});
        await Authorship.createEmptyAuthorships(doc, authorshipsData);
    },
    clone: function (authorship) {
        const newAuthorship = Authorship.filterFields(authorship);
        newAuthorship.affiliations = authorship.affiliations.map(aff => {
            if (aff.institute)
                return aff.institute;

            return aff.id;
        });

        return newAuthorship;
    },
    updateAuthorshipData: async function (authorshipId, docId, authorshipData) {
        if (!docId) throw "updateAuthorshipData error!";

        const newAuthData = Authorship.clone(authorshipData);
        newAuthData.document = docId;

        await Affiliation.destroy({authorship: authorshipId, document: docId});
        await Authorship.update({id: authorshipId}, newAuthData);
    },
    createAuthorshipData: async function (docId, authorshipData) {
        if (!docId) throw "updateAuthorshipData error!";

        const newAuthData = Authorship.clone(authorshipData);
        newAuthData.document = docId;

        await Authorship.create(newAuthData);
    },
    setPrivacy: async function (documentId, userId, privacy) {
        const authorship = await Authorship.findOne({document: documentId, researchEntity: userId});
        if (!authorship)
            throw 'Athorship not found';

        authorship.public = !!privacy;
        return authorship.savePromise();
    },
    setFavorite: async function (documentId, userId, favorite) {
        if (favorite) {
            const favorited = await Authorship.find({researchEntity: userId, favorite: true});
            if (favorited.length >= sails.config.scientilla.maxUserFavorite)
                throw 'Favorite max limit reached';
        }

        const authorship = await Authorship.findOne({document: documentId, researchEntity: userId});
        if (!authorship)
            throw 'Athorship not found';

        authorship.favorite = !!favorite;
        return authorship.savePromise();
    }
});

