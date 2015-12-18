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
        draftReferences: {
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
        }
    },
    verifyDraft: function (referenceId) {
        return Reference.findOneById(referenceId)
                .then(function (r) {
                    var draftGroupCreator = r.draftGroupCreator;
                    r.draftGroupCreator = null;
                    r.draft = false;
                    r.privateGroups.add(draftGroupCreator);
                    return r.save();
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

