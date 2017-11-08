/* global Authorship, Affiliation*/
"use strict";

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
        favorite: 'boolean',
        synchronize: 'boolean',
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
            corresponding: false,
            affiliations: []
        };
    },
    createEmptyAuthorships: async function (doc, authorshipsData) {
        //TODO Add empty authorships generated from authorStr

        if (!_.isArray(authorshipsData))
            return;

        const authorshipFields = ['position', 'corresponding'];
        const filteredAuthorshipsData = _.map(authorshipsData, a => _.pick(a, authorshipFields));
        _.forEach(filteredAuthorshipsData, a => a.document = doc.id);
        const authorships = await Authorship.create(filteredAuthorshipsData);

        const affiliations = [];
        for (const authData of authorshipsData)
            if (_.isArray(authData.affiliations))
                for (const aff of authData.affiliations) {
                    const institute = _.isObject(aff) ? aff.institute : aff;
                    const auth = authorships.find(a => a.position === authData.position);
                    affiliations.push({
                        authorship: auth.id,
                        institute: institute
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
        return {
            position: authorship.position,
            researchEntity: authorship.researchEntity,
            synchronize: authorship.synchronize,
            corresponding: authorship.corresponding,
            document: authorship.document,
            affiliations: authorship.affiliations.map(aff => {
                if (aff.institute)
                    return aff.institute;

                return aff.id;
            })
        };
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

