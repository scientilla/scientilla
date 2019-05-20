/* global Author, Affiliation, Institute, ResearchEntity, AuthorAffiliation*/
"use strict";

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'position',
    'authorStr',
    'corresponding',
    'firstCoauthor',
    'lastCoauthor',
    'oralPresentation',
    'researchItem',
    'verify',
    'affiliations',
];

module.exports = _.merge({}, BaseModel, {
    attributes: {
        position: 'integer',
        authorStr: {
            columnName: 'author_str',
            type: 'string'
        },
        corresponding: 'boolean',
        firstCoauthor: {
            columnName: 'first_coauthor',
            type: 'boolean'
        },
        lastCoauthor: {
            columnName: 'last_coauthor',
            type: 'boolean'
        },
        oralPresentation: {
            columnName: 'oral_presentation',
            type: 'boolean'
        },
        researchItem: {
            columnName: 'research_item',
            model: 'researchitem'
        },
        verify: {
            model: 'Verify'
        },
        affiliations: {
            collection: 'Institute',
            via: 'author',
            through: 'authoraffiliation'
        }
    },
    getDefaults(researchItemId, authorStr, position) {
        return {
            researchItem: researchItemId,
            authorStr: authorStr,
            position: position,
            corresponding: false,
            first_coauthor: false,
            last_coauthor: false,
            oral_presentation: false
        };
    },
    getFields() {
        return fields;
    },
    filterFields(authorData) {
        if (!_.isObject(authorData))
            return {};
        const newAuthorData = {};
        Object.keys(authorData)
            .filter(key => fields.includes(key))
            .forEach(f => newAuthorData[f] = authorData[f]);
        return newAuthorData;
    },
    areEquals(author1, author2) {
        const authData1 = _.cloneDeep(Author.filterFields(author1));
        const authData2 = _.cloneDeep(Author.filterFields(author2));
        authData1.affiliations = authData1.affiliations.map(af => _.isObject(af) ? af.id : af);
        authData2.affiliations = authData2.affiliations.map(af => _.isObject(af) ? af.id : af);

        return !Object.keys(authData1).find(key => !_.isEqual(authData1[key], authData2[key]));
    },
    splitAuthorStr(authorsStr) {
        return authorsStr.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
    },
    getMatchingAuthorsData(authorsStr, authorsData) {
        if (!Array.isArray(authorsData) || authorsData.length === 0)
            return [];

        const authorsStrArr = Author.splitAuthorStr(authorsStr);
        const clonedAuthorsData = _.cloneDeep(authorsData);

        return authorsStrArr.map((authorStr, position) => {
            const newAuthorByPos = clonedAuthorsData.find(a => a.position === position);
            if (!!newAuthorByPos && newAuthorByPos.authorStr === authorStr) //the authorData is correct
                return newAuthorByPos;

            const newAuthorByStr = clonedAuthorsData.find(a => a.authorStr === authorStr);
            if (!newAuthorByStr) return;

            if (newAuthorByStr.position === position) //newAuthorByStr is the correct authorData
                return newAuthorByStr;
            else if (newAuthorByStr.authorStr !== authorsStrArr[newAuthorByStr.position]) {
                //the current position of newAuthorByStr is not correct
                newAuthorByStr.position = position;
                return newAuthorByStr;
            }

        }).filter(a => a);

    },
    async updateAuthors(researchItem, authorsStr, newAuthorsData = []) {
        if (!researchItem || !researchItem.id || !authorsStr)
            return;

        if (authorsStr === '')
            return await Author.destroy({researchItem: researchItem.id});

        const cleanAuthorsData = Author.cleanauthorData(newAuthorsData);
        cleanAuthorsData.forEach(a => {
            delete a.authorStr;
            a.researchItem = researchItem.id;
        });

        if (researchItem.needsAffiliations())
            for (const i in cleanAuthorsData)
                cleanAuthorsData[i].affiliations = await Author.getFixedCollection(Institute, newAuthorsData[i].affiliations);

        const authorsStrArr = Author.splitAuthorStr(authorsStr);

        const currentAuthors = await Author.find({researchItem: researchItem.id}).populate('affiliations');
        const currentAuthorsData = currentAuthors.map(a => {
            const af = Author.filterFields(a);
            af.id = a.id;
            return af;
        });

        const authorsToDelete = currentAuthorsData.filter(a => a.position >= authorsStrArr.length);
        const authorsToCreate = [];
        const authorsToUpdate = [];

        authorsStrArr.forEach((authorStr, position) => {
            const currentAuthor = currentAuthorsData.find(a => a.position === position);
            const newAuthorData = cleanAuthorsData.find(a => a.position === position);
            const defaults = !!currentAuthor && currentAuthor.authorStr === authorStr ?
                Author.filterFields(currentAuthor) :
                Author.getDefaults(researchItem.id, authorStr, position);
            const newAuthor = Object.assign({}, defaults, newAuthorData);

            if (currentAuthor && currentAuthor.verify)
                return; //TODO handle when currentAuthor is verified

            if (!currentAuthor) //the researchItem is new or the authorsStr is longer than before
                authorsToCreate.push(newAuthor);
            else if (!Author.areEquals(currentAuthor, newAuthor))
                authorsToUpdate.push({current: currentAuthor, 'new': newAuthor});
        });

        if (authorsToDelete.length)
            await Author.destroy({id: authorsToDelete.map(a => a.id)});

        if (authorsToCreate.length)
            await Author.create(authorsToCreate);

        for (const author of authorsToUpdate)
            await Author.update({id: author.current.id}, author.new);

    },
    cleanauthorData(authorsData) {
        const cleanAuthorsData = [];
        for (const authorData of authorsData) {
            const cleanAuthorData = Author.filterFields(authorData);
            delete cleanAuthorData.researchItem;
            cleanAuthorsData.push(cleanAuthorData);
        }
        return cleanAuthorsData;

    },
    async verify(researchEntity, researchItem, verify, verificationData) {
        const authorData = await Author.getAuthorData(researchEntity, researchItem, verificationData);

        if (!Number.isInteger(authorData.position))
            throw {researchItem: researchItem, success: false, message: 'Author position or alias not specified'};

        if (researchItem.needsAffiliations() && authorData.affiliations.length === 0)
            throw {researchItem: researchItem, success: false, message: 'Affiliations not specified'};

        const author = await Author.findOne({
            researchItem: researchItem.id,
            position: authorData.position
        });

        if (!author) throw {researchItem: researchItem, success: false, message: 'Critcal error: author not found'};
        if (author.verify) throw {
            researchItem: researchItem,
            success: false,
            message: 'Position already verified'
        };

        author.verify = verify.id;
        await author.savePromise();

        if (researchItem.needsAffiliations()) {
            await AuthorAffiliation.destroy({author: author.id});
            await AuthorAffiliation.create(authorData.affiliations.map(a => ({author: author.id, institute: a})));
        }
    },
    async getAuthorData(researchEntity, researchItem, verificationData) {
        if (researchEntity.isGroup())
            return {};

        const authors = await Author.find({researchItem: researchItem.id}).populate('affiliations');
        const aliases = (await ResearchEntity.getAliases(researchEntity)).map(a => a.toLocaleLowerCase());
        let position;

        if (verificationData && Number.isInteger(verificationData.position))
            position = verificationData.position;
        else {
            const author = authors.find(a => aliases.includes(a.authorStr.toLocaleLowerCase()));
            if (!author) return {};
            position = author.position
        }

        const author = authors.find(a => a.position === position);
        if (author.authorStr && !aliases.includes(author.authorStr.toLocaleLowerCase()))
            await ResearchEntity.addAlias(researchEntity, author.authorStr);

        return {
            position: position,
            affiliations: Array.isArray(verificationData.affiliations) ?
                await Author.getFixedCollection(Institute, verificationData.affiliations) :
                author.affiliations.map(a => a.id)
        };
    }
});

