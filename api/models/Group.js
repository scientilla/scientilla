/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var _ = require('lodash');
var Promise = require("bluebird");
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
    verifyDraft: function (groupId, referenceId) {
        return Reference.findOneById(referenceId)
                .then(function (draft) {
                    var draftGroupCreator = draft.draftGroupCreator;
                    draft.draftGroupCreator = null;
                    draft.draft = false;
                    draft.privateGroups.add(draftGroupCreator);
                    return draft.savePromise();
                    //STODO: return the new reference
                });
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedReferences: function (groupId) {
        return Membership.find({group: groupId})
                .then(function (memberships) {
                    var memberIds = _.map(memberships, 'user');
                    //sTODO: refactor
                    var funs = _.map(memberIds, function (userId) {
                        return User.getReferences(User, userId, ['privateCoauthors', 'publicCoauthors', 'privateGroups'], 'verified')
                    })
                    return Promise.all(funs);
                })
                //sTODO: sobstitute with spread operator
                .then(function (referencesGroup) {
                    var references = _.flatten(referencesGroup);
                    return references;
                })
                .then(function (maybeSuggestedReferences) {
                    return Group.filterNecessaryReferences(groupId, Group, maybeSuggestedReferences)
                });
    }
});

