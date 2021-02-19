/* global require, Project,ResearchItemTypes, ResearchItemProjectCompetitive, ResearchItemProjectIndustrial, ResearchItemKinds  */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'kind',
    'type',
    'draftCreator',
    'code',
    'acronym',
    'title',
    'abstract',
    'startDate',
    'endDate',
    'projectType',
    'category',
    'payment',
    'role',
    'status',
    'url',
    'members',
    'researchLines',
    'logos',
    'projectData'
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        start_year: 'desc',
        title: 'asc',
        id: 'desc'
    },
    migrate: 'safe',
    tableName: 'project',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        kind: 'STRING',
        type: {
            model: 'researchitemtype'
        },
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        code: 'STRING',
        acronym: 'STRING',
        title: 'STRING',
        abstract: 'STRING',
        startDate: {
            type: 'STRING',
            columnName: 'start_date'
        },
        endDate: {
            type: 'STRING',
            columnName: 'end_date'
        },
        startYear: {
            type: 'STRING',
            columnName: 'start_year'
        },
        endYear: {
            type: 'STRING',
            columnName: 'end_year'
        },
        projectType: {
            type: 'STRING',
            columnName: 'project_type'
        },
        projectType2: {
            type: 'STRING',
            columnName: 'project_type_2'
        },
        category: {
            type: 'STRING',
            columnName: 'category'
        },
        payment: {
            type: 'STRING',
            columnName: 'payment'
        },
        role: 'STRING',
        status: 'STRING',
        url: 'STRING',
        members: 'JSON',
        piStr: {
            type: 'STRING',
            columnName: 'pi_str'
        },
        researchLines: {
            type: 'JSON',
            columnName: 'research_lines'
        },
        logos: 'JSON',
        projectData: {
            type: 'JSON',
            columnName: 'project_data'
        },
        verified: {
            collection: 'projectverify',
            via: 'project'
        },
        verifiedUsers: {
            collection: 'user',
            through: 'projectverifieduser'
        },
        verifiedGroups: {
            collection: 'group',
            through: 'projectverifiedgroup'
        },
        favorites: {
            collection: 'researchentity',
            via: 'favoriteprojects',
            through: 'projectfavorite'
        },
        async isValid() {
            const ResearchItemModel = Project.getResearchItemModel(this.type);
            const ri = await ResearchItemModel.findOne({researchItem: this.id});
            return ri.isValid();
        },
        toJSON() {
            const project = this.toObject();
            project.pi = project.members
                .filter(m => ['pi', 'co_pi'].includes(m.role))
                .map(m => ({
                    email: m.email,
                    name: m.name,
                    surname: m.surname
                }));
            project.lines = project.researchLines.map(rl => ({
                code: rl.code,
                description: rl.description
            }));
            project.searchPi = project.pi.map(p => `${p.email}-${p.name} ${p.surname}`).join(',');
            return project
        }
    },
    getResearchItemModel(type) {
        const researchItemModels = {
            [ResearchItemTypes.PROJECT_COMPETITIVE]: ResearchItemProjectCompetitive,
            [ResearchItemTypes.PROJECT_INDUSTRIAL]: ResearchItemProjectIndustrial
        };
        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    },
    async createResearchItem(itemData) {
        const ResearchItemModel = this.getResearchItemModel(itemData.type);
        const selectedData = await ResearchItemModel.selectData(itemData);
        if (!ResearchItemModel.validateProjectData(selectedData))
            throw {
                researchItem: selectedData,
                success: false,
                message: 'Data not valid',
                errors: ResearchItemModel.validationErrors()
            };
        selectedData.projectData = JSON.stringify(selectedData.projectData);
        return ResearchItemModel.create(selectedData);

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
        if (!ResearchItemModel.validateProjectData(selectedData))
            throw {
                researchItem: selectedData,
                success: false,
                message: 'Data not valid',
                errors: ResearchItemModel.validationErrors()
            };

        selectedData.projectData = JSON.stringify(selectedData.projectData);
        return ResearchItemModel.update({id: current.id}, selectedData);
    },
    async getVerifiedCopy(researchItem) {
        const project = await Project.findOne({id: researchItem.id});
        const projectData = {};
        fields.forEach(f => projectData[f] = project[f]);
        delete projectData.draftCreator;
        delete projectData.projectData;
        delete projectData.members;
        delete projectData.researchLines;
        delete projectData.logos;
        projectData.kind = ResearchItemKinds.VERIFIED;

        const copies = await Project.find(projectData);

        if (copies.length > 1)
            sails.log.debug(`WARNING Project.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    },
    async getVerifiedExternal(external) {
        return await Project.findOne({
            code: external.code,
            kind: ResearchItemKinds.VERIFIED
        });
    },
    getPis(members) {
        return members
            .filter(m => ['pi', 'co_pi'].includes(m.role))
            .map(m => ({
                email: m.email,
                name: m.name,
                surname: m.surname
            }));
    },
    async export(projectIds, format) {
        const projects = await Project.find({id: projectIds})
            .populate([
                'type',
            ]);

        if (format === 'csv')
            return Exporter.projectsToCsv(projects);

        throw {
            success: false,
            message: 'Format not supported'
        };
    },
});


