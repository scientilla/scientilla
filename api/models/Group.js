/* global AuthorshipGroup, Document, DocumentOrigins, GruntTaskRunner, SqlService, Promise, Group, PerformanceCalculator */
'use strict';

/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const ResearchEntity = require('../lib/ResearchEntity');

module.exports = _.merge({}, ResearchEntity, {
    DEFAULT_SORTING: {
        name: 'asc',
        updatedAt: 'desc'
    },
    searchKey: 'slug',
    attributes: {
        name: 'STRING',
        slug: {
            type: 'STRING'
        },
        shortname: 'TEXT',
        description: 'TEXT',
        publicationsAcronym: 'TEXT',
        type: 'STRING',
        cdr: 'STRING',
        active: 'BOOLEAN',
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
        memberships: {
            collection: 'membership',
            via: 'group'
        },
        drafts: {
            collection: 'Document',
            via: 'draftGroupCreator'
        },
        documents: {
            collection: 'document',
            via: 'groups',
            through: 'authorshipgroup'
        },
        publicDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'publicauthorshipgroup'
        },
        publications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'publicationgroup'
        },
        highImpactPublications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'highimpactpublicationgroup'
        },
        disseminationTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'disseminationtalkgroup'
        },
        scientificTalks: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'scientifictalkgroup'
        },
        authorships: {
            collection: 'authorshipGroup',
            via: 'researchEntity',
        },
        discardedDocuments: {
            collection: 'Document',
            via: 'discardedGroups',
            through: 'discardedgroup'
        },
        suggestedDocuments: {
            collection: 'document',
            via: 'groups',
            through: 'documentsuggestiongroup'
        },
        externalDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'externaldocumentgroup'
        },
        notDuplicateDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'documentnotduplicategroup'
        },
        getType: function () {
            return 'group';
        },
        scopusId: {
            type: 'STRING'
        },
        institute: {
            model: 'institute'
        },
        attributes: {
            collection: 'Attribute',
            through: 'groupattribute'
        }
    },
    getAuthorshipsData: async function (document, groupId, newAffiliationData = {}) {
        return {
            isVerifiable: true,
            document: document,
            synchronize: !_.isNil(newAffiliationData.synchronize) ? newAffiliationData.synchronize : document.synchronized,
            public: true
        };
    },
    doVerifyDocument: async function (document, researchEntityId, authorshipData) {
        const authorship = {
            researchEntity: researchEntityId,
            document: document.id,
            synchronize: authorshipData.synchronize,
            public: authorshipData.public,
        };
        await AuthorshipGroup.create(authorship);
        return document;
    },
    getDefaultGroup: function () {
        //TODO: id must be read from settings
        const defaultInstituteName = sails.config.scientilla.institute.name;
        return Group.findOneByName(defaultInstituteName)
            .populate('members')
            .populate('administrators');
    },
    addMember: function (group, user) {
        group.members.add(user);
        return group.savePromise();
    },
    addAdministrator: function (group, user) {
        if (group.administrators.length == 0)
            group.administrators.add(user);
        return group.savePromise();
    },
    addUserToDefaultGroup: function (user) {
        return Group.getDefaultGroup()
            .then(group => Group.addAdministrator(group, user))
            .then(group => Group.addMember(group, user))
            .then(() => user);
    },
    getAuthorshipModel: function () {
        return AuthorshipGroup;
    },
    updateProfile: async function (groupId, groupData) {
        delete groupData.memberships;
        delete groupData.members;
        const oldResearchEntity = await Group.findOne({id: groupId});
        const res = await Group.update({id: groupId}, groupData);
        const newResearchEntity = res[0];

        const command = 'import:external:group:' + newResearchEntity.id;
        if (newResearchEntity.scopusId !== oldResearchEntity.scopusId)
            GruntTaskRunner.run(command + ':' + DocumentOrigins.SCOPUS);
        if (newResearchEntity.publicationsAcronym !== oldResearchEntity.publicationsAcronym)
            GruntTaskRunner.run(command + ':' + DocumentOrigins.PUBLICATIONS);

        return newResearchEntity;
    },
    getMBOInstitutePerformance: async function (cdr, year) {
        if (cdr) {
            const group = await Group.findOne({cdr}).populate('documents');
            if(!group)
                throw 'Group not found';
            return await PerformanceCalculator.getGroupInstitutePerformance(group, year);
        }

        return await PerformanceCalculator.getGroupsInstitutePerformance(year);
    },
    getMBOInvitedTalks: async function (cdr, year) {
        if (cdr) {
            const group = await Group.findOne({cdr}).populate('documents');
            if(!group)
                throw 'Group not found';
            return await PerformanceCalculator.getGroupMBOInvitedTalks(group, year);
        }

        return await PerformanceCalculator.getGroupsMBOInvitedTalks(year);
    }
});
