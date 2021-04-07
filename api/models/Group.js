/* global require, ResearchEntity, AuthorshipGroup, Document, DocumentOrigins, GruntTaskRunner, SqlService, Promise, Group, PerformanceCalculator, DocumentKinds, DocumentNotDuplicateGroup, ChartData */
'use strict';

/**
 * Group.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

const _ = require('lodash');
const SubResearchEntity = require('../lib/SubResearchEntity');

module.exports = _.merge({}, SubResearchEntity, {
    DEFAULT_SORTING: {
        name: 'asc',
        updatedAt: 'desc'
    },
    attributes: {
        name: {
            type: 'STRING'
        },
        slug: {
            type: 'STRING'
        },
        shortname: 'TEXT',
        description: 'TEXT',
        type: 'STRING',
        code: 'STRING',
        active: 'BOOLEAN',
        starting_date: 'DATE',
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
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
        oralPresentations: {
            collection: 'Document',
            via: 'researchEntity',
            through: 'oralpresentationgroup'
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
        favoriteDocuments: {
            collection: 'document',
            via: 'groups',
            through: 'favoritedocumentgroup'
        },
        externalDocuments: {
            collection: 'document',
            via: 'researchEntity',
            through: 'externaldocumentgroup'
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
        getType: function () {
            return 'group';
        },
        getModel: function () {
            return Group;
        },
        getDocumentNotDuplicateModel: function () {
            return DocumentNotDuplicateGroup;
        }
    },
    getDocumentNotDuplicateModel: () => DocumentNotDuplicateGroup,
    afterCreate: async function (group, cb) {
        if (!group.id)
            return cb();

        await ResearchEntity.createResearchEntity(Group, group, 'group');

        cb();
    },
    afterDestroy: async function (destroyedGroups, proceed) {
        // Loop over destroyed groups
        for (const group of destroyedGroups) {

            // Delete ResearchEntity record of user
            await ResearchEntity.destroy({ id: group.researchEntity });

            // Delete ChartData record of user
            await ChartData.destroy({
                researchEntityType: 'group',
                researchEntity: group.id
            });
        }

        proceed();
    },
    getAuthorshipsData: async function (document, groupId, newAffiliationData = {}) {
        return {
            isVerifiable: true,
            document: document,
            synchronize: !_.isNil(newAffiliationData.synchronize) ? newAffiliationData.synchronize : document.synchronized,
            public: true
        };
    },
    getDocumentVerifyErrors: async function (researchEntityId, document, verificationData, check = true, docToRemove) {
        const alreadyVerifiedDocuments = await AuthorshipGroup.find({
            document: document.id,
            researchEntity: researchEntityId
        });
        if (alreadyVerifiedDocuments.length)
            return {
                error: 'Document already verified',
                item: researchEntityId
            };

        if (!document || document.kind !== DocumentKinds.VERIFIED)
            return {
                error: 'Document not found',
                item: researchEntityId
            };

        if (check && (await SubResearchEntity.getDuplicates(Group, researchEntityId, document, docToRemove)).length > 0) {
            return {
                error: 'Documents must be compared',
                item: document
            };
        }

        const searchCond = {
            scopusId: document.scopusId
        };
        if (docToRemove)
            searchCond.id = {'!': docToRemove};

        if (check && document.scopusId) {
            const alreadyVerifiedDocuments = (await Group
                .findOne(researchEntityId)
                .populate('documents', searchCond)).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Document already verified (duplicated scopusId)',
                    item: document
                };
        }

        if (!(await document.hasMainInstituteAffiliated()))
            return {
                error: 'Document without authors affiliated with ' + sails.config.scientilla.institute.shortname,
                item: document
            };

        return null;
    },
    getDraftVerifyErrors: async function (researchEntityId, draft, verificationData, check, docToRemove) {
        if (!draft || draft.kind !== DocumentKinds.DRAFT)
            return {
                error: 'Document not found',
                item: null
            };
        if (!draft.isValid())
            return {
                error: 'Document not valid for verification',
                item: draft
            };

        if (check && (await SubResearchEntity.getDuplicates(Group, researchEntityId, draft, docToRemove)).length > 0) {
            return {
                error: 'Documents must be compared',
                item: draft
            };
        }

        if (check && draft.scopusId) {
            const searchCond = {
                scopusId: draft.scopusId
            };
            if (docToRemove)
                searchCond.id = {'!': docToRemove};
            const alreadyVerifiedDocuments = (await Group
                .findOne(researchEntityId)
                .populate('documents', searchCond)).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Document already verified (duplicated scopusId)',
                    item: draft
                };
        }

        if (!(await draft.hasMainInstituteAffiliated()))
            return {
                error: 'Document without authors affiliated with ' + sails.config.scientilla.institute.shortname,
                item: draft
            };

        return null;
    },
    doVerifyDocument: async function (document, researchEntityId, authorshipData) {
        await Group.removeDiscarded(Group, researchEntityId, document.id);
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
