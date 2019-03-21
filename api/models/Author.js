/* global Author, Affiliation, Institute*/
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
    'verify'
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
        const authData1 = Author.filterFields(author1);
        const authData2 = Author.filterFields(author2);
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
    async updateAuthors(researchItemId, authorsStr, newAuthorsData = []) {
        if (!researchItemId || !authorsStr)
            return;

        if (authorsStr === '')
            return await Author.destroy({researchItem: researchItemId});

        const cleanAuthorsData = Author.cleanauthorData(newAuthorsData);
        cleanAuthorsData.forEach(a => {
            delete a.authorStr;
            a.researchItem = researchItemId;
        });

        const authorsStrArr = Author.splitAuthorStr(authorsStr);

        const currentAuthors = await Author.find({researchItem: researchItemId});
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
                Author.filterFields(currentAuthor) : Author.getDefaults(researchItemId, authorStr, position);
            const newAuthor = Object.assign({}, defaults, newAuthorData);

            if (!!currentAuthor && !!currentAuthor.verify)
                return; //TODO handle when currentAuthor is verified

            if (!currentAuthor) //the researchItem is new or the authorsStr is longer than before
                authorsToCreate.push(newAuthor);
            else if (!Author.areEquals(currentAuthor, newAuthor)) {
                authorsToUpdate.push({
                    current: currentAuthor,
                    'new': newAuthor
                });
            }
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

    }
});

