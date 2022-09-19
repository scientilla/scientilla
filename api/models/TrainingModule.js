/* global require, sails, TrainingModule, ResearchItemTypes, ResearchItemTrainingModule, ResearchItemKinds, Exporter  */
'use strict';

const _ = require('lodash');
const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'type',
    'kind',
    'authorsStr',
    'referent',
    'otherCourse',
    'institute',
    'phdCourse',
    'title',
    'year',
    'description',
    'hours',
    'lectures',
    'researchDomains',
    'location',
    'delivery',
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        year: 'desc',
        title: 'asc',
        id: 'desc'
    },
    migrate: 'safe',
    tableName: 'training_module',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        type: {
            model: 'researchitemtype'
        },
        kind: 'STRING',
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        referent: {
            model: 'user'
        },
        otherCourse: {
            type: 'BOOLEAN',
            columnName: 'other_course'
        },
        institute: {
            model: 'phdinstitute'
        },
        phdCourse: {
            model: 'phdcourse',
            columnName: 'phd_course'
        },
        title: 'STRING',
        year: 'STRING',
        description: 'STRING',
        hours: 'INTEGER',
        lectures: 'INTEGER',
        researchDomains: {
            type: 'JSON',
            columnName: 'research_domains'
        },
        location: 'STRING',
        delivery: 'STRING',
        verified: {
            collection: 'trainingmoduleverify',
            via: 'trainingModule'
        },
        verifiedUsers: {
            collection: 'user',
            through: 'trainingmoduleverifieduser'
        },
        verifiedGroups: {
            collection: 'group',
            through: 'trainingmoduleverifiedgroup'
        },
        authors: {
            collection: 'trainingmoduleauthor',
            via: 'trainingModule'
        },
        affiliations: {
            collection: 'trainingmoduleaffiliation',
            via: 'trainingModule',
        },
        institutes: {
            collection: 'institute',
            via: 'trainingModule',
            through: 'trainingmoduleaffiliation'
        },
        suggestions: {
            collection: 'researchentity',
            via: 'suggestedtrainingmodules',
            through: 'trainingmodulesuggestion'
        },
        async isValid() {
            const ResearchItemModel = TrainingModule.getResearchItemModel(this.type);
            const ri = await ResearchItemModel.findOne({researchItem: this.id});
            return ri.isValid();
        }
    },
    getResearchItemModel(_) {
        return ResearchItemTrainingModule;
    },
    async createResearchItem(itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        const preparedData = ResearchItemModel.prepare(selectedData);
        return ResearchItemModel.create(preparedData);

    },
    async updateResearchItem(researchItemId, itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const current = await ResearchItemModel.findOne({researchItem: researchItemId});
        if (!current)
            throw {
                researchItem: researchItemId,
                success: false,
                message: 'Project update: research item not found'
            };
        const selectedData = await ResearchItemModel.selectData(itemData);
        const preparedData = ResearchItemModel.prepare(selectedData);
        return ResearchItemModel.update({id: current.id}, preparedData);
    },
    async getVerifiedCopy(researchItem) {
        const ri = await TrainingModule.findOne({id: researchItem.id});
        const riData = {};
        fields.forEach(f => riData[f] = ri[f]);
        delete riData.draftCreator;
        riData.researchDomains = JSON.stringify(riData.researchDomains);
        riData.kind = ResearchItemKinds.VERIFIED;

        const copies = await TrainingModule.find(riData);

        if (copies.length > 1)
            sails.log.debug(`WARNING Accomplishment.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal() {
        return false;
    },
    async export(trainingModulesIds, format) {
        let trainingModules = await TrainingModule.find({id: trainingModulesIds}).populate([
            'referent',
            'institute',
            'phdCourse'
        ]);

        trainingModules = _.orderBy(trainingModules, ['year', 'title'], ['desc', 'asc']);

        if (format === 'csv')
            return Exporter.trainingModulesToCsv(trainingModules);

        throw {
            success: false,
            message: 'Format not supported'
        };
    }
});

