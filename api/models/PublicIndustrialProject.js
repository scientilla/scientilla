/* global require, Project */
'use strict';

const _ = require('lodash');

const BaseModel = require("../lib/BaseModel.js");

const publicFields = [
    'id',
    'code',
    'acronym',
    'title',
    'abstract',
    'startDate',
    'startYear',
    'endDate',
    'endYear',
    'projectType',
    'status',
    'url',
    'authorsStr',
];


module.exports = _.merge({}, BaseModel, {
    DEFAULT_SORTING: {
        start_year: 'desc',
        acronym: 'asc',
        id: 'desc'
    },
    migrate: 'safe',
    tableName: 'project_industrial',
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
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        toJSON() {
            const project = this.toObject();
            const json = {};
            publicFields.forEach(f => json[f] = project[f]);

            json.pi = Project.getPis(project.members);
            json.lines = project.researchLines.map(rl => ({
                code: rl.code,
                description: rl.description
            }));

            return json;
        }
    }
});


