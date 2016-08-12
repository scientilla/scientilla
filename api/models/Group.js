/* global Reference, SqlService, Promise, Group */

/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var _ = require('lodash');
var researchEntity = require('./ResearchEntity');

module.exports = _.merge({}, researchEntity, {
    attributes: {
        name: 'STRING',
        slug: 'STRING',
        description: 'TEXT',
        publicationsAcronym: 'TEXT',
        memberships: {
            collection: 'membership',
            via: 'group'
        },
        collaborations: {
            collection: 'collaboration',
            via: 'group'
        },
        administrators: {
            collection: 'user',
            via: 'admininstratedGroups'
        },
        drafts: {
            collection: 'Reference',
            via: 'draftGroupCreator'
        },
        privateReferences: {
            collection: 'Reference',
            via: 'privateGroups'
        },
        publicReferences: {
            collection: 'Reference',
            via: 'publicGroups'
        },
        discardedReferences: {
            collection: 'Reference',
            via: 'discardedGroups'
        },
        suggestedReferences: {
            collection: 'reference',
            via: 'suggestedGroups'
        },
        getType: function () {
            return 'group';
        },
        scopusId: {
            type: 'STRING'
        }
    },
    draftToDocument: function (draft, researchEntityId) {
        draft.draftGroupCreator = null;
        draft.privateGroups.add(researchEntityId);
    },
    copyDraft: function(userId, document) {
        var draftData = _.pick(document, Reference.getFields());
        draftData.draft = true;
        draftData.draftGroupCreator = userId;
        return Reference.create(draftData);
    },
    //sTODO: add deep populate for other fields of the documents
    getSuggestedDocumentsQuery: function (groupId, query) {

        var groupDocumentsIds = {
            select: 'reference_privateGroups',
            from: 'group_privatereferences__reference_privategroups',
            where: {
                'group_privateReferences': groupId
            }
        };

        var groupUsers = {
            select: ['user.id'],
            from: 'user',
            join: [
                {
                    from: 'membership',
                    on: {
                        'user': 'id',
                        'membership': 'user'
                    }
                }
            ],
            where: {'group': groupId},
            as: 'groupUsers'
        };

        var groupSuggestedDocumentIds = {
            select: ['reference_privateCoauthors'],
            from: groupUsers,
            join: [
                {
                    from: 'reference_privatecoauthors__user_privatereferences',
                    on: {
                        'groupUsers': 'id',
                        'reference_privatecoauthors__user_privatereferences': 'user_privateReferences'
                    }
                }
            ],
            where: {
                'reference_privateCoauthors': {
                    'not in': groupDocumentsIds
                }
            }
        };

        var groupSuggestedDocuments = {
            select: [
                'reference.*',
                'reference_discardedGroups as discarded'
            ],
            from: 'reference',
            leftJoin: [
                {
                    from: 'group_discardedreferences__reference_discardedgroups',
                    on: {
                        'reference': 'id',
                        'group_discardedreferences__reference_discardedgroups': 'reference_discardedGroups'
                    }
                }
            ],
            where: {
                'reference.id': {
                    in: groupSuggestedDocumentIds
                }
            },
            as: 'groupSuggestedDocuments'
        };

        var q = {
            select: '*',
            from: groupSuggestedDocuments
        };

        q.where = _.merge({}, q.where, query.where);
        q.orderBy = Reference.DEFAULT_SORTING;
        q.skip = query.skip;
        q.limit = query.limit;

        return Promise.resolve(q);
    }
});
