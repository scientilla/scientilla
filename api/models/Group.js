/* global Document, SqlService, Promise, Group */
'use strict';

/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const ResearchEntity = require('../lib/ResearchEntity');

function buildCheckDuplicatedDocuments(checkAgainstFunction) {
    return function(documents, researchEntityId) {
        return ResearchEntity.checkCopiedDocuments(Group, researchEntityId, documents, checkAgainstFunction);
    }
}

module.exports = _.merge({}, ResearchEntity, {
    attributes: {
        name: 'STRING',
        slug: 'STRING',
        shortname: 'TEXT',
        description: 'TEXT',
        publicationsAcronym: 'TEXT',
        collaborations: {
            collection: 'collaboration',
            via: 'group'
        },
        administrators: {
            collection: 'user',
            via: 'administratedGroups',
            through: 'groupadministrator'
        },
        members: {
            collection: 'User',
            via: 'memberships',
            through: 'membership'
        },
        drafts: {
            collection: 'Document',
            via: 'draftGroupCreator',
            _postPopulate: buildCheckDuplicatedDocuments(ResearchEntity.getAllDocuments)
        },
        documents: {
            collection: 'document',
            via: 'groups',
            through: 'authorshipgroup',
            _postPopulate: buildCheckDuplicatedDocuments(ResearchEntity.getAllVerifiedDocuments)
        },
        authorships: {
            collection: 'authorshipGroup',
            via: 'researchEntity',
        },
        discardedDocuments: {
            collection: 'Document',
            via: 'discardedGroups',
            through: 'discardedgroup',
            _postPopulate: buildCheckDuplicatedDocuments(ResearchEntity.getAllDocuments)
        },
        suggestedDocuments: {
            collection: 'document',
            via: 'groups',
            through: 'documentsuggestiongroup',
            _postPopulate: buildCheckDuplicatedDocuments(ResearchEntity.getAllDocuments)
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
    },
    getAuthorshipsData: function (document) {
        return Promise.resolve({
            isVerifiable: true,
            document: document
        });
    },
    doVerifyDocument: function (document, researchEntityId) {
        const authorship = {
            researchEntity: researchEntityId,
            document: document.id
        };
        return AuthorshipGroup.create(authorship)
            .then(()=>document);
    },
    discardDocument: function (researchEntityId, documentId) {
        return DiscardedGroup.findOrCreate({researchEntity: researchEntityId, document: documentId});
    },
    getDefaultGroup: function () {
        //TODO: id must be read from settings
        const defaultInstituteName = sails.config.scientilla.institute.name;
        return Group.findOneByName(defaultInstituteName).populate('members');
    },
    addMember: function(group, user) {
        group.members.add(user);
        return group.save();
    }
});
