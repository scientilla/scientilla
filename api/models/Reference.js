/* global Reference, sails, User, ObjectComparer */

/**
 * Reference.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var _ = require('lodash');
var Promise = require('bluebird');

//sTODO: evaluated whether convert the constants to numbers
var VERIFIED = 'verified';
var DRAFT = 'draft';
var PUBLIC = 'public';


module.exports = {
    /* CONSTANTS */
    VERIFIED: VERIFIED,
    DRAFT: DRAFT,
    PUBLIC: PUBLIC,
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
        authors: 'STRING',
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
        publicCoauthors: {
            collection: 'User',
            via: 'publicReferences'
        },
        privateCoauthors: {
            collection: 'User',
            via: 'privateReferences'
        },
        discardedCoauthors: {
            collection: 'User',
            via: 'discardedReferences'
        },
        publicGroups: {
            collection: 'Group',
            via: 'publicReferences'
        },
        privateGroups: {
            collection: 'Group',
            via: 'privateReferences'
        },
        discardedGroups: {
            collection: 'Group',
            via: 'discardedReferences'
        },
        draft: 'BOOLEAN',
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
                'authors',
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
            if (!this.authors)
                return [];
            var authors = this.authors.replace(/\s+et all\s*/i, '').split(',').map(_.trim);
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
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(self);
                    }
                });
            });
        }
    },
    getFields: function () {
        var fields = [
            'authors',
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
            return document.privateCoauthors.length +
                    document.publicCoauthors.length +
                    document.privateGroups.length +
                    document.publicGroups.length;
        }
        return Reference.findOneById(documentId)
                .populate('privateCoauthors')
                .populate('publicCoauthors')
                .populate('privateGroups')
                .populate('publicGroups')
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
    getByIdsWithAuthors: function (referenceIds) {
        return Reference.findById(referenceIds)
                .populate('privateCoauthors')
                .populate('publicCoauthors')
                .populate('privateGroups')
                .populate('publicGroups');
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
    verifyDraft: function (draftId, ResearchEntityModel, researchEntityId) {
        //sTODO: 2 equals documents should be merged
        return Reference.findOneById(draftId)
                .then(function (draft) {
                    if (!draft || !draft.draft) {
                        throw new Error('Draft ' + draftId + ' does not exist');
                    }
                    if (!draft.isValid()) {
                        return draft;
                    }
                    draft.draft = false;
                    ResearchEntityModel.draftToDocument(draft, researchEntityId);
                    return Reference.findCopies(draft)
                            .then(function (documents) {
                                var n = documents.length;
                                if (n === 0)
                                    return draft
                                            .savePromise();
                                if (n > 1)
                                    sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
                                return draft
                                        .destroy()
                                        .then(function () {
                                            var doc = documents[0];
                                            sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + doc.id);
                                            return ResearchEntityModel
                                                    .verifyDocument(ResearchEntityModel, researchEntityId, doc.id);
                                        });
                            });
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
};
