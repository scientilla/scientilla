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
        type: 'STRING',
        code: 'STRING',
        active: 'BOOLEAN',
        collaborations: {
            collection: 'collaboration',
            via: 'group'
        },
        starting_date: 'DATE',
        administrators: {
            collection: 'user',
            via: 'administratedGroups',
            through: 'groupadministrator'
        },
        pis: {
            collection: 'user',
            via: 'managedGroups',
            through: 'principalinvestigator'
        },
        members: {
            collection: 'User',
            via: 'memberships',
            through: 'membership'
        },
        allMembers: {
            collection: 'User',
            through: 'allmembership'
        },
        memberships: {
            collection: 'membership',
            via: 'group'
        },
        allMemberships: {
            collection: 'allmembership',
            via: 'group'
        },
        childGroups: {
            collection: 'group',
            via: 'parent_group',
            through: 'membershipgroup'
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
        favoritePublications: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'favoritepublicationgroup'
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
        },
        groupAttributes: {
            collection: 'groupattribute',
            via: 'researchEntity',
        },
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
        return Membership.create({
            user: user.id,
            group: group.id,
            lastsynch: null,
            active: true,
            synchronized: true
        });
    },
    addAdministrator: function (group, user) {
        if (group.administrators.length === 0)
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

        return newResearchEntity;
    },
    getMBOInstitutePerformance: async function (cdr, year) {
        if (cdr) {
            const group = await Group.findOne({code: cdr}).populate('documents');
            if (!group)
                throw 'Group not found';
            return await PerformanceCalculator.getGroupInstitutePerformance(group, year);
        }

        return await PerformanceCalculator.getGroupsInstitutePerformance(year);
    },
    getMBOInvitedTalks: async function (cdr, year) {
        if (cdr) {
            const group = await Group.findOne({code: cdr}).populate('documents');
            if (!group)
                throw 'Group not found';
            return await PerformanceCalculator.getGroupMBOInvitedTalks(group, year);
        }

        return await PerformanceCalculator.getGroupsMBOInvitedTalks(year);
    }
});
