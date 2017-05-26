/* global Document, sails, User, ObjectComparer, Authorship, DocumentKinds */
'use strict';

/**
 * Document.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const Promise = require('bluebird');
const BaseModel = require("../lib/BaseModel.js");
const actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

const fields = [
    {name: 'authorsStr'},
    {name: 'authorKeywords'},
    {name: 'title'},
    {name: 'year'},
    {name: 'source'},
    {name: 'itSource'},
    {name: 'issue'},
    {name: 'volume'},
    {name: 'pages'},
    {name: 'articleNumber'},
    {name: 'doi'},
    {name: 'abstract'},
    {name: 'type'},
    {name: 'sourceType'},
    {name: 'scopusId'},
    {name: 'wosId'},
    {name: 'iitPublicationsId'},
    {name: 'origin'},
    {name: 'kind'}
];

module.exports = _.merge({}, BaseModel, {
    /* CONSTANTS */
    DEFAULT_SORTING: {
        year: 'desc',
        updatedAt: 'desc',
        title: 'asc'
    },
    /* ATTRIBUTES */
    attributes: {
        title: 'STRING',
        authorsStr: 'STRING',
        authorKeywords: 'STRING',
        year: 'STRING',
        issue: 'STRING',
        volume: 'STRING',
        pages: 'STRING',
        articleNumber: 'STRING',
        doi: 'STRING',
        type: 'STRING',
        sourceType: 'STRING',
        itSource: 'STRING',
        scopusId: 'STRING',
        wosId: 'STRING',
        iitPublicationsId: 'STRING',
        abstract: 'TEXT',
        kind: 'STRING',
        origin: 'STRING',
        editedAfterImport: {
            type: "BOOLEAN",
            defaultsTo: false
        },
        source: {
            model: 'source'
        },
        authors: {
            collection: 'user',
            via: 'documents',
            through: 'authorship'
        },
        suggestions: {
            collection: 'user',
            via: 'documents',
            through: 'documentsuggestion'
        },
        externalUsers: {
            collection: 'user',
            via: 'document',
            through: 'externaldocument'
        },
        externalGroups: {
            collection: 'group',
            via: 'document',
            through: 'externaldocumentgroup'
        },
        groupSuggestions: {
            collection: 'group',
            via: 'documents',
            through: 'documentsuggestiongroup'
        },
        groups: {
            collection: 'group',
            via: 'documents',
            through: 'authorshipgroup'
        },
        authorships: {
            collection: 'authorship',
            via: 'document'
        },
        affiliations: {
            collection: 'affiliation',
            via: 'document',
        },
        institutes: {
            collection: 'institute',
            via: 'document',
            through: 'affiliation'
        },
        duplicates: {
            collection: 'documentduplicate',
            via: 'document',
            getCriteria: async function (req) {
                const researchEntityId = req.param('parentid');
                const researchEntityType = req.path.includes('user') ? 'user' : 'group';
                return {
                    'researchEntity': researchEntityId,
                    'researchEntityType': researchEntityType
                };
            }
        },
        userTags: {
            collection: 'tag',
            via: 'document'
        },
        tagLabels: {
            collection: 'tagLabel',
            via: 'documents',
            through: 'tag'
        },
        groupTags: {
            collection: 'taggroup',
            via: 'document'
        },
        groupTagLabels: {
            collection: 'tagLabel',
            via: 'documents',
            through: 'taggroup'
        },
        discardedCoauthors: {
            collection: 'User',
            via: 'discardedDocuments',
            through: 'discarded'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedDocuments',
            through: 'discardedgroup'
        },
        draftCreator: {
            model: 'User'
        },
        draftGroupCreator: {
            model: 'Group'
        },
        isValid: function () {
            const authorsStrRegex = /^((\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)(,\s(\w|-|')+(\s(\w|-|')+)*((\s|-)?\w\.)+)*$/;
            const self = this;
            const requiredFields = [
                'authorsStr',
                'title',
                'year',
                'type',
                'sourceType'
            ];
            if (this.type === DocumentTypes.INVITED_TALK)
                requiredFields.push('itSource');
            else
                requiredFields.push('source');

            return _.every(requiredFields, function (v) {
                    return self[v];
                }) && authorsStrRegex.test(self.authorsStr);
        },
        draftToDocument: function () {
            this.kind = DocumentKinds.VERIFIED;
            this.draftCreator = null;
            this.draftGroupCreator = null;
            return this.savePromise();
        },
        getAuthors: function () {
            if (!this.authorsStr)
                return [];
            var authors = this.authorsStr.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
            return authors;
        },
        getUcAuthors: function () {
            var authors = this.getAuthors();
            var ucAuthors = _.map(authors, function (a) {
                return a.toUpperCase();
            });
            return ucAuthors;
        },
        getAuthorIndex: function (author) {
            return _.findIndex(this.getAuthors(), a => _.includes(author.getAliases(), a));
        },
        isPositionVerified: function (position) {
            if (!this.authorships)
                return false;

            const authorship = this.getAuthorshipByPosition(position);

            return !!authorship && !_.isNil(authorship.researchEntity);
        },
        getAuthorshipByPosition: function (position) {
            if (_.isNil(this.authorships))
                throw 'getAuthorshipByPosition: authorships missing';

            return this.authorships.find(a => a.position === position);
        },
        getFullAuthorships: function () {
            if (_.isEmpty(this.affiliations) || _.isEmpty(this.authorships))
                return [];

            return this.authorships.map(authorship => {
                authorship.affiliations = this.affiliations.filter(affiliation => authorship.id === affiliation.authorship);
                return authorship;
            });
        }
    },
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    },
    deleteIfNotVerified: function (documentId) {
        function countAuthorsAndGroups(document) {
            return document.authors.length +
                document.groups.length +
                document.discardedCoauthors.length +
                document.discardedGroups.length;
        }

        return Document.findOneById(documentId)
            .populate('authors')
            .populate('groups')
            .populate('authorships')
            .populate('affiliations')
            .populate('discardedCoauthors')
            .populate('discardedGroups')
            .then(function (document) {
                if (!document)
                    throw new Error('Document ' + documentId + ' does not exist');
                if (countAuthorsAndGroups(document) == 0) {
                    sails.log.debug('Document ' + documentId + ' will be deleted');
                    return Document.destroy({id: documentId});
                }
                return document;
            })
            .then(function (document) {
                if (_.isArray(document))
                    return document[0];
                return document;
            });
    },
    filterSuggested: function (maybeSuggestedDocuments, toBeDiscardedDocuments, similarityThreshold) {
        var suggestedDocuments = [];
        _.forEach(maybeSuggestedDocuments, function (r1) {
            var checkAgainst = _.union(toBeDiscardedDocuments, suggestedDocuments);
            var discard = _.some(checkAgainst, function (r2) {
                return r1.getSimilarity(r2) > similarityThreshold;
            });
            if (discard)
                return;
            suggestedDocuments.push(r1);
        });
        return suggestedDocuments;
    },
    deleteDrafts: function (draftIds) {
        return Promise.all(draftIds.map(function (documentId) {
            return Document.destroy({id: documentId});
        }));
    },
    findCopies: function (verifyingDraft, verifyingPosition) {
        const query = _.pick(verifyingDraft, Document.getFields());
        query.kind = {'!': DocumentKinds.DRAFT};
        return Document.find(query)
            .populate('authorships')
            .populate('affiliations')
            .then(similarDocs => {
                const draftFullAuthorships = verifyingDraft.getFullAuthorships();
                const copies = similarDocs.filter(d => {
                    let isCopy = true;
                    const copyFullAuthorships = d.getFullAuthorships();

                    copyFullAuthorships.forEach(cfa => {
                        if (cfa.position === verifyingPosition)
                            return;
                        if (!_.isNil(cfa.researchEntity))
                            return;
                        const dfa = draftFullAuthorships.find(dfa => dfa.position === cfa.position);

                        if (!_.isEqual(
                                _.map(cfa.affiliations, 'institute').sort(),
                                _.map(dfa.affiliations, 'institute').sort()))
                            isCopy = false;
                    });

                    if (!isCopy) return false;

                    draftFullAuthorships.forEach(dfa => {
                        if (dfa.position === verifyingPosition)
                            return;
                        const cfa = draftFullAuthorships.find(cfa => cfa.position === dfa.position);
                        if (!_.isNil(cfa.researchEntity))
                            return;

                        if (!_.isEqual(
                                _.map(cfa.affiliations, 'institute').sort(),
                                _.map(dfa.affiliations, 'institute').sort()))
                            isCopy = false;
                    });
                    return isCopy;
                });

                return copies;
            });
    },
    createOrUpdate: async function (criteria, documentData) {
        const selectedData = Document.selectData(documentData);

        let doc = await Document.findOne(criteria);
        if (doc)
            await Document.update(criteria, selectedData);
        else
            await Document.create(selectedData);

        if (documentData.authorships) {
            doc = await Document.findOne(criteria);
            await Authorship.destroy({document: doc.id});
            await Authorship.createEmptyAuthorships(doc.id, documentData);
        }
    }
});
