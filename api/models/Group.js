/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var _ = require('lodash');
var Promise = require("bluebird");

module.exports = {
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
        }
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedReferences: function (groupId) {
        return Group.findOneById(groupId)
                .populate('collaboratedReferences')
                .then(function (group) {
                    return Reference.getVerifiedAndPublicReferences(group.collaboratedReferences);
                })
                .then(function (suggestedReferences) {
                    //sTODO union must discard same references
                    var maybeSuggestedReferencesId = _.map(suggestedReferences, 'id');

                    return Promise.all([
                        Reference.findById(maybeSuggestedReferencesId)
                                .populate('collaborators')
                                .populate('owner')
                                .populate('groupOwner'),
                        Reference.find({groupOwner: groupId})
                    ])
                })
                .spread(function (maybeSuggestedReferences, authoredReferences) {
                    var similarityThreshold = .98;
                    //sTODO: add check on discarded references
                    return Reference.filterSuggested(maybeSuggestedReferences, authoredReferences, similarityThreshold);
                });
    }
};

