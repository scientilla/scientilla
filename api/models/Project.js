/* global require, Project,ResearchItemTypes, ResearchItemProjectCompetitive, ResearchItemProjectIndustrial, ResearchItemKinds  */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    'kind',
    'type',
    'draftCreator',
    'code',
    'acronym',
    'title',
    'abstract',
    'instituteStartDate',
    'instituteEndDate',
    'projectType',
    'role',
    'status',
    'url',
    'members',
    'researchLines',
    'logos',
    'projectData'
];

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {},
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
        projectType: {
            type: 'STRING',
            columnName: 'project_type'
        },
        role: 'STRING',
        status: 'STRING',
        url: 'STRING',
        members: 'JSON',
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
                    email: m.email
                }));
            project.lines = project.researchLines.map(rl => rl.code)
            project.searchPi = project.pi.map(p => p.email).join(',');
            delete project.projectData;
            delete project.members;
            delete project.researchLines;
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
        projectData.kind = ResearchItemKinds.VERIFIED;

        const copies = await Project.find(projectData);

        if (copies.length > 1)
            sails.log.debug(`WARNING Project.getVerifiedCopy found ${copies.length} copies`);

        return copies.length > 0 ? copies[0] : false;
    }
});


