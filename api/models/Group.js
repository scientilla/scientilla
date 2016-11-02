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
        shortname: 'TEXT',
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
        documents: {
            collection: 'reference',
            via: 'groups',
            through: 'authorshipgroup'
        },
        authorships: {
            collection: 'authorshipGroup',
            via: 'researchEntity',
        },
        discardedReferences: {
            collection: 'Reference',
            via: 'discardedGroups'
        },
        suggestedReferences: {
            collection: 'reference',
            via: 'suggestedGroups'
        },
        suggestedDocuments: {
            collection: 'reference',
            via: 'groups',
            through: 'documentsuggestiongroup'
        },
        getType: function () {
            return 'group';
        },
        scopusId: {
            type: 'STRING'
        },
        institute: {
            model: 'institute'
        }
    }
});
