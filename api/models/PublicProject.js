/* global require, ResearchItemTypes */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {},
    migrate: 'safe',
    tableName: 'project',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        type: {
            model: 'researchitemtype'
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
            project.type = ResearchItemTypes.getType(project.type);
            delete project.projectData;
            delete project.members;
            delete project.researchLines;
            return project
        }
    }
});


