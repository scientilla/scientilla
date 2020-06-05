/* global require, ResearchItemTypes */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

const projectFields = {
    4: [
        'code',
        'acronyn',
        'title',
        'abstract',
        'startDate',
        'startYear',
        'endDate',
        'endYear',
        'projectType',
        'projectType2',
        'role',
        'status',
        'url',
        'logos',
        'piStr',
    ],
    5: [
        'code',
        'acronyn',
        'title',
        'abstract',
        'startDate',
        'startYear',
        'endDate',
        'endYear',
        'projectType',
        'status',
        'url',
        'piStr',
    ]
}


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
        startYear: {
            type: 'STRING',
            columnName: 'start_year'
        },
        endDate: {
            type: 'STRING',
            columnName: 'end_date'
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
        piStr: {
            type: 'STRING',
            columnName: 'pi_str'
        },
        toJSON() {
            const project = this.toObject();
            const json = {};
            projectFields[project.type].forEach(f => json[f] = project[f]);

            json.pi = project.members
                .filter(m => ['pi', 'co_pi'].includes(m.role))
                .map(m => ({
                    email: m.email,
                    name: m.name,
                    surname: m.surname
                }));
            json.lines = project.researchLines.map(rl => ({
                code: rl.code,
                description: rl.description
            }));

            return json
        }
    }
});


