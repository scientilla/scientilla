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

function buildCheckDuplicatedDocuments(includeDrafts = true) {
    return function(documents, researchEntityId) {
        return ResearchEntity.checkCopiedDocuments(Group, researchEntityId, documents, includeDrafts);
    }
}

module.exports = _.merge({}, ResearchEntity, {
    DEFAULT_SORTING: {
        name: 'asc',
        updatedAt: 'desc'
    },
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
            _postPopulate: buildCheckDuplicatedDocuments()
        },
        documents: {
            collection: 'document',
            via: 'groups',
            through: 'authorshipgroup',
            _postPopulate: buildCheckDuplicatedDocuments(false)
        },
        authorships: {
            collection: 'authorshipGroup',
            via: 'researchEntity',
        },
        discardedDocuments: {
            collection: 'Document',
            via: 'discardedGroups',
            through: 'discardedgroup',
            _postPopulate: buildCheckDuplicatedDocuments()
        },
        suggestedDocuments: {
            collection: 'document',
            via: 'groups',
            through: 'documentsuggestiongroup',
            _postPopulate: buildCheckDuplicatedDocuments()
        },
        externalDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'externaldocumentgroup'
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
        return ResearchEntity
            .doUnverifyDocument(Group, researchEntityId, documentId)
            .then(() => DiscardedGroup.findOrCreate({researchEntity: researchEntityId, document: documentId}));
    },
    getDefaultGroup: function () {
        //TODO: id must be read from settings
        const defaultInstituteName = sails.config.scientilla.institute.name;
        return Group.findOneByName(defaultInstituteName)
            .populate('members')
            .populate('administrators');
    },
    addMember: function(group, user) {
        group.members.add(user);
        return group.savePromise();
    },
    addAdministrator: function(group, user) {
        if (group.administrators.length == 0)
            group.administrators.add(user);
        return group.savePromise();
    },
    addUserToDefaultGroup: function(user) {
        return Group.getDefaultGroup()
            .then(group => Group.addAdministrator(group, user))
            .then(group => Group.addMember(group, user))
            .then(() => user);
    }
});
