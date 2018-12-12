/* global Authorship, Affiliation, Institute*/
"use strict";

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'researchEntity',
    'document',
    'affiliations',
    'authorStr',
    'position',
    'synchronize',
    'corresponding',
    'public',
    'favorite',
    'first_coauthor',
    'last_coauthor',
    'oral_presentation'
];

const documentFields = [
    'affiliations',
    'corresponding',
    'first_coauthor',
    'last_coauthor',
    'oral_presentation'
];

const researchEntityFields = [
    'researchEntity',
    'synchronize',
    'public',
    'favorite'
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
        authorStr: 'string',
        public: 'boolean',
        favorite: 'boolean',
        synchronize: 'boolean',
        corresponding: 'boolean',
        first_coauthor: 'boolean',
        last_coauthor: 'boolean',
        oral_presentation: 'boolean',
        unverify: function () {
            const empty = Authorship.getEmpty(this.authorStr, this.position, this.document);
            researchEntityFields.forEach(f => this[f] = empty[f]);
            return this.savePromise();
        },
        isVerified() {
            return !!this.researchEntity;
        },
        hasAffiliations() {
            return !!this.affiliations.length;
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
    getEmpty: function (authorStr, position, document) {
        return {
            authorStr: authorStr,
            position: position,
            document: document,
            synchronize: null,
            researchEntity: null,
            corresponding: false,
            'public': true,
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
        Object.keys(authorshipData)
            .filter(key => fields.includes(key))
            .forEach(f => newAuthorship[f] = authorshipData[f]);
        return newAuthorship;
    },
    isMetadataEqual(a1, a2, fields = documentFields) {
        if (fields.includes('affiliations') && !_.isEmpty(_.xor(a1.affiliations.map(a => a.institute), a2.affiliations.map(a => a.institute))))
            return false;

        const fieldsToCheck = fields.filter(f => f !== 'affiliations');
        return fieldsToCheck.every(f => a1[f] === a2[f]);
    },
    async cleanAuthorshipsData(authorshipsData) {
        const cleanAuthorshipsData = [];
        for (const newAuthorshipData of authorshipsData) {
            const cleanAuthorshipData = Authorship.filterFields(newAuthorshipData);
            delete cleanAuthorshipData.document;
            cleanAuthorshipData.affiliations = await Authorship.getFixedCollection(Institute, newAuthorshipData.affiliations);
            if (!cleanAuthorshipData.affiliations)
                cleanAuthorshipData.affiliations = [];

            cleanAuthorshipsData.push(cleanAuthorshipData);
        }
        return cleanAuthorshipsData;
    },
    areEquals(authorship1, authorship2) {
        const authData1 = Authorship.filterFields(authorship1);
        const authData2 = Authorship.filterFields(authorship2);
        return !Object.keys(authData1).find(key => !_.isEqual(authData1[key], authData2[key]));
    },
    async getMatchingAuthorshipsData(document, authorshipsData) {
        const authors = document.getAuthors();

        const fixedNewAuthorshipsData = _.cloneDeep(authorshipsData);
        if (fixedNewAuthorshipsData.length > 0) {

            //removes wrong authorships
            fixedNewAuthorshipsData.slice().reverse().forEach((newAuthorship, index) => {
                const correctPosition = authors.findIndex(authorStr => authorStr === newAuthorship.authorStr);
                if (correctPosition === -1)
                    return fixedNewAuthorshipsData.splice(fixedNewAuthorshipsData.length - 1 - index, 1);

                if (correctPosition !== newAuthorship.position) {
                    const correctPositionNewAuthorship = fixedNewAuthorshipsData.find(a => a.position === correctPosition);
                    if (!correctPositionNewAuthorship)
                        newAuthorship.position = correctPosition;
                    else if (correctPositionNewAuthorship.authorStr && correctPositionNewAuthorship.authorStr !== newAuthorship.authorStr) {
                        correctPositionNewAuthorship.position = undefined;
                        newAuthorship.position = correctPosition;
                    } else
                        fixedNewAuthorshipsData.splice(fixedNewAuthorshipsData.length - 1 - index, 1);
                    return;
                }

                if (newAuthorship.authorStr && !authors.includes(newAuthorship.authorStr))
                    return fixedNewAuthorshipsData.splice(fixedNewAuthorshipsData.length - 1 - index, 1);
            });

            return fixedNewAuthorshipsData;
        }
    },
    async updateAuthorships(doc, newAuthorshipsData = []) {
        if (!doc.id)
            return;

        if (!doc.authorsStr || doc.authorsStr === '')
            return await Authorship.destroy({document: doc.id});

        const cleanAuthorshipsData = await Authorship.cleanAuthorshipsData(newAuthorshipsData);
        cleanAuthorshipsData.forEach(a => a.document = doc.id);

        const authors = doc.getAuthors();

        const currentAuthorships = await Authorship.find({document: doc.id}).populate('affiliations');
        const currentAuthorshipsData = currentAuthorships.map(a => {
            const ad = Authorship.filterFields(a);
            ad.id = a.id;
            ad.affiliations = ad.affiliations.map(af => af.id);
            return ad;
        });

        const authorshipsToDelete = currentAuthorshipsData.filter(a => a.position >= authors.length);
        const authorshipsToCreate = [];
        const authorshipsToUpdate = [];

        authors.forEach((authorStr, position) => {
            const currentAuthorship = currentAuthorshipsData.find(a => a.position === position);
            const newAuthorshipData = cleanAuthorshipsData.find(a => a.position === position);
            const defaults = !!currentAuthorship && currentAuthorship.authorStr === authorStr ? Authorship.filterFields(currentAuthorship) : Authorship.getEmpty(authorStr, position, doc.id);
            const newAuthorship = Object.assign({}, defaults, newAuthorshipData);

            if (!currentAuthorship) //the document is new or the authorsStr is longer than before
                authorshipsToCreate.push(newAuthorship);
            else if (newAuthorshipData && !Authorship.areEquals(currentAuthorship, newAuthorship)) {
                //there is a current authorship and a different new authorship is passed by param

                authorshipsToUpdate.push({
                    current: currentAuthorship,
                    'new': newAuthorship
                });
            } else if (currentAuthorship.authorStr !== authorStr) {
                //there is a wrong current authorship and no new authorship is passed.

                if (currentAuthorship.researchEntity)
                    throw 'UpdateAuthorships error'; //TODO handle when currentAuthorship is verified

                authorshipsToUpdate.push({
                    current: currentAuthorship,
                    'new': newAuthorship
                });
            }
        });

        if (authorshipsToDelete.length)
            await Authorship.destroy({id: authorshipsToDelete.map(a => a.id)});

        if (authorshipsToCreate.length)
            await Authorship.create(authorshipsToCreate);

        for (const authorship of authorshipsToUpdate)
            await Authorship.update({id: authorship.current.id}, authorship.new);

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

