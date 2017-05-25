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

const fields = [
    {name: 'authorsStr', weight: 0.4},
    {name: 'authorKeywords', weight: 0},
    {name: 'title', weight: 1},
    {name: 'year', weight: .6},
    {name: 'source', weight: 0},
    {name: 'itSource', weight: 0},
    {name: 'issue', weight: 0},
    {name: 'volume', weight: 0},
    {name: 'pages', weight: 0},
    {name: 'articleNumber', weight: 0},
    {name: 'doi', weight: 0.5},
    {name: 'abstract', weight: 0.1},
    {name: 'type', weight: 0.2},
    {name: 'sourceType', weight: 0.2},
    {name: 'scopusId', weight: 0.6},
    {name: 'wosId', weight: 0.1},
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
        getSimiliarity: function (doc, minThreeshold = 0) {
            const p = 2;
            var self = this;
            if (ObjectComparer.compareStrings(self.title, doc.title) < .6)
                return .45;
            const comparisonFields = fields.filter(f => f.weight);
            const tmp = _.reduce(comparisonFields, function (sum, f) {
                var fieldSimilarity = ObjectComparer.compareStrings(self[f.name], doc[f.name]);
                return sum + Math.pow(fieldSimilarity, p) * f.weight;
            }, 0);
            const similarity = Math.pow(tmp / _.sumBy(fields, 'weight'), 1 / p);
            return similarity;
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
    getSuggestedCollaborators: function (documentId) {
        return Promise.all([
            Document.findOne(documentId).populate('collaborators'),
            User.find()
        ])
            .then(function (results) {
                var document = results[0];
                var users = results[1];
                var authors = document.getUcAuthors();
                var possibleAuthors = _.filter(
                    users,
                    function (u) {
                        var aliases = u.getUcAliases();
                        return !_.isEmpty(_.intersection(aliases, authors));
                    }
                );
                var collaboratorsId = _.map(document.collaborators, "id");
                var suggestedUsers = _.reject(
                    possibleAuthors,
                    function (u) {
                        return u.id === document.owner
                            || _.includes(collaboratorsId, u.id);
                    }
                );

                //TODO: search by aliases directly in the db
                //select *  from document where authors ilike any (select '%' || str || '%' from alias)
                return suggestedUsers;
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
