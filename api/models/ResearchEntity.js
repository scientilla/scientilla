/* global require, ResearchEntity, User, Alias, Discarded */
'use strict';

const _ = require("lodash");
const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_entity',
    attributes: {
        type: 'STRING',
        user: {
            collection: 'user',
            via: 'researchEntity'
        },
        group: {
            collection: 'group',
            via: 'researchEntity'
        },
        researchItemDrafts: {
            collection: 'researchitem',
            via: 'draftCreator'
        },
        accomplishmentDrafts: {
            collection: 'accomplishment',
            via: 'draftCreator'
        },
        accomplishments: {
            collection: 'accomplishment',
            through: 'accomplishmentverify'
        },
        suggestedAccomplishments: {
            collection: 'accomplishment',
            through: 'accomplishmentsuggestion'
        },
        favoriteAccomplishments: {
            collection: 'accomplishment',
            through: 'accomplishmentfavorite'
        },
        discardedAccomplishments: {
            collection: 'accomplishment',
            through: 'discardedaccomplishment'
        },
        projects: {
            collection: 'project',
            through: 'projectverify'
        },
        projectDrafts: {
            collection: 'project',
            via: 'draftCreator'
        },
        suggestedProjects: {
            collection: 'project',
            through: 'projectsuggestion'
        },
        discardedProjects: {
            collection: 'project',
            through: 'discardedproject'
        },
        publicCompetitiveProjects: {
            collection: 'publiccompetitiveproject',
            through: 'publiccompetitiveprojectverify'
        },
        publicIndustrialProjects: {
            collection: 'publicindustrialproject',
            through: 'publicindustrialprojectverify'
        },
        favoriteProjects: {
            collection: 'project',
            through: 'projectfavorite'
        },
        patents: {
            collection: 'patent',
            through: 'patentverify'
        },
        suggestedPatents: {
            collection: 'patent',
            through: 'patentsuggestion'
        },
        discardedPatents: {
            collection: 'patent',
            through: 'discardedpatent'
        },
        patentFamilies: {
            collection: 'patentfamily',
            through: 'patentfamilyverify'
        },
        favoritePatents: {
            collection: 'patent',
            through: 'patentfavorite'
        },
        trainingModules: {
            collection: 'trainingmodule',
            through: 'trainingmoduleverify'
        },
        suggestedTrainingModules: {
            collection: 'trainingmodule',
            through: 'trainingmodulesuggestion'
        },
        trainingModuleDrafts: {
            collection: 'trainingmodule',
            via: 'draftCreator'
        },
        discardedTrainingModules: {
            collection: 'trainingmodule',
            through: 'discardedtrainingmodule'
        },
        isGroup() {
            return this.type === 'group';
        }
    },
    async createResearchEntity(Model, re, type) {
        if (!re.id)
            return;

        const entity = await ResearchEntity.create({type: type});
        re.researchEntity = entity.id;
        await Model.update({id: re.id}, {researchEntity: entity.id});
    },
    async getAliases(researchEntity) {
        if (!researchEntity || researchEntity.isGroup())
            return [];

        const user = await ResearchEntity.getUser(researchEntity.id).populate('aliases');
        return user.getAliases();
    },
    async addAlias(researchEntity, authorStr) {
        if (!researchEntity || researchEntity.isGroup())
            throw {
                success: false,
                message: 'Invalid research entity'
            };

        const user = await ResearchEntity.getUser(researchEntity.id);
        await Alias.addAlias(user.id, authorStr, 0);

        return {
            success: true
        };
    },
    async discardResearchItem(researchItemId, researchEntityId) {
        if (!researchEntityId || !researchItemId)
            throw {
                researchItem: researchItemId,
                success: false,
                message: 'Invalid research item or entity'
            };

        const discarded = await Discarded.findOrCreate({
            researchEntity: researchEntityId,
            researchItem: researchItemId
        });

        return {
            discarded,
            success: true
        };
    },
    getUser(researchEntityId) {
        return User.findOne({researchEntity: researchEntityId});
    }
});
