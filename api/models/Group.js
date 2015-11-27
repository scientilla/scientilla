/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

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
        references: {
            collection: 'Reference',
            via: 'groupOwner'
        },
        collaboratedReferences: {
            collection: 'reference',
            via: 'groupCollaborations'
        },
    },
    //sTODO: add deep populate for other fields of the references
    getSuggestedReferences: function (groupId) {
        return Promise.all([
            Group.findOneById(groupId)
                    .populate('collaboratedReferences')
                    .then(function (group) {
                        return Reference.getVerifiedAndPublicReferences(group.collaboratedReferences);
                    }),
            Reference.find({groupOwner: groupId})
        ])
                .then(function (results) {
                    var similarityThreshold = .98;
                    //sTODO union must discard same references
                    var maybeSuggestedReferences = results[0];
                    //sTODO: refactor
                    //sTODO: add check on discarded references
                    var authoredReferences = results[1];
                    return Reference.filterSuggested(maybeSuggestedReferences, authoredReferences, similarityThreshold);
                });
    }
};

