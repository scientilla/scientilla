/* global Reference, sails, User, ObjectComparer */

/**
 * Reference.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


const _ = require('lodash');
const Promise = require('bluebird');
const BaseModel = require("../lib/BaseModel.js");

//sTODO: evaluated whether convert the constants to numbers
const VERIFIED = 'verified';
const DRAFT = 'draft';
const PUBLIC = 'public';


module.exports = _.merge({}, BaseModel, {
    /* CONSTANTS */
    DEFAULT_SORTING: {
        year: 'desc',
        updatedAt: 'desc',
        title: 'asc'
    },
    /* ATTRIBUTES */
    attributes: {
        title: {
            type: 'STRING'
        },
        authorsStr: 'STRING',
        year: 'STRING',
        journal: 'STRING',
        issue: 'STRING',
        volume: 'STRING',
        pages: 'STRING',
        articleNumber: 'STRING',
        doi: 'STRING',
        bookTitle: 'STRING',
        editor: 'STRING',
        publisher: 'STRING',
        conferenceName: 'STRING',
        conferenceLocation: 'STRING',
        acronym: 'STRING',
        type: 'STRING',
        sourceType: 'STRING',
        scopusId: 'STRING',
        wosId: 'STRING',
        abstract: 'TEXT',
        draft: 'BOOLEAN',
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
        discardedCoauthors: {
            collection: 'User',
            via: 'discardedReferences'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedReferences'
        },
        draftCreator: {
            model: 'User'
        },
        draftGroupCreator: {
            model: 'Group'
        },
        suggestedGroups: {
            collection: 'Group',
            via: 'suggestedReferences'
        },
        isValid: function () {
            var self = this;
            var requiredFields = [
                'authorsStr',
                'title',
                'year',
                'type',
                'sourceType'
            ];
            var requiredFieldsTable = {
                conference: [
                    'conferenceName'
                ],
                book: [
                    'bookTitle'
                ],
                journal: [
                    'journal'
                ]
            };
            var otherRequiredFields = requiredFieldsTable[this.sourceType];
            requiredFields = _.union(requiredFields, otherRequiredFields);
            return _.every(requiredFields, function (v) {
                return self[v];
            });
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
        getSimiliarity: function (doc) {
            var similarityFields = Reference.getFields();
            var similarity = 1;
            var self = this;
            _.forEach(similarityFields, function (f) {
                var fieldSimilarity = ObjectComparer.compareStrings(self[f], doc[f]);
                similarity *= fieldSimilarity;
            });
            return similarity;
        },
        getAuthorIndex: function (author) {
            return _.findIndex(this.getAuthors(), a => _.includes(author.getAliases(), a));
        },
        getAuthorshipAffiliationsByPosition: function (position) {
            if(_.isNil(this.authorships))
                throw 'getAuthorshipAffiliations: authorships missing';
            if(_.isNil(this.affiliations))
                throw 'getAuthorshipAffiliations: affiliations missing';
            const authorship = this.authorships.find(a => a.position == position);
            if(!authorship) return [];

            return this.affiliations
                .filter(a => a.authorship == authorship.id)
                .map(a => a.institute);
        }
    },
    getFields: function () {
        var fields = [
            'authorsStr',
            'title',
            'year',
            'journal',
            'issue',
            'volume',
            'pages',
            'articleNumber',
            'doi',
            'bookTitle',
            'editor',
            'publisher',
            'conferenceName',
            'conferenceLocation',
            'acronym',
            'abstract',
            'type',
            'sourceType',
            'scopusId',
            'wosId'
        ];
        return fields;
    },
    deleteIfNotVerified: function (documentId) {
        function countAuthorsAndGroups(document) {
            return document.authors.length +
                document.groups.length;
        }

        return Reference.findOneById(documentId)
            .populate('authors')
            .populate('groups')
            .then(function (document) {
                if (!document)
                    throw new Error('Document ' + documentId + ' does not exist');
                if (countAuthorsAndGroups(document) === 0) {
                    sails.log.debug('Document ' + documentId + ' will be deleted');
                    return Reference.destroy({id: documentId});
                }
                return document;
            })
            .then(function (document) {
                if (_.isArray(document))
                    return document[0];
                return document;
            });
    },
    getSuggestedCollaborators: function (referenceId) {
        return Promise.all([
            Reference.findOne(referenceId).populate('collaborators'),
            User.find()
        ])
            .then(function (results) {
                var reference = results[0];
                var users = results[1];
                var authors = reference.getUcAuthors();
                var possibleAuthors = _.filter(
                    users,
                    function (u) {
                        var aliases = u.getUcAliases();
                        return !_.isEmpty(_.intersection(aliases, authors));
                    }
                );
                var collaboratorsId = _.map(reference.collaborators, "id");
                var suggestedUsers = _.reject(
                    possibleAuthors,
                    function (u) {
                        return u.id === reference.owner
                            || _.includes(collaboratorsId, u.id);
                    }
                );

                //TODO: search by aliases directly in the db
                //select *  from reference where authors ilike any (select '%' || str || '%' from alias)
                return suggestedUsers;
            });

    },
    filterSuggested: function (maybeSuggestedReferences, toBeDiscardedReferences, similarityThreshold) {
        var suggestedReferences = [];
        _.forEach(maybeSuggestedReferences, function (r1) {
            var checkAgainst = _.union(toBeDiscardedReferences, suggestedReferences);
            var discard = _.some(checkAgainst, function (r2) {
                return r1.getSimilarity(r2) > similarityThreshold;
            });
            if (discard)
                return;
            suggestedReferences.push(r1);
        });
        return suggestedReferences;
    },
    getVerifiedAndPublicReferences: function (references) {
        return _.filter(references, function (r) {
            return _.includes([VERIFIED, PUBLIC], r.status);
        });
    },
    deleteDrafts: function (draftIds) {
        return Promise.all(draftIds.map(function (documentId) {
            return Reference.destroy({id: documentId});
        }));
    },
    findCopies: function (doc) {
        var query = _.pick(doc, Reference.getFields());
        query.draft = false;
        return Reference.find(query);
    }
});
