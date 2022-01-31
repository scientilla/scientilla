/* global require, ResearchItemProjectAgreement, JsonValidator */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const validate = JsonValidator.getProjectAgreementValidator();

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_project_agreement',
    attributes: {
        researchItem: {
            model: 'researchitem',
            columnName: 'research_item',
            unique: true
        },
        group: {
            model: 'group'
        },
        startYear: {
            type: 'STRING',
            columnName: 'start_year'
        },
        endYear: {
            type: 'STRING',
            columnName: 'end_year'
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        projectData: {
            type: 'JSON',
            columnName: 'project_data'
        },
        isValid: () => true,
    },
    getFields() {
        return ['researchItem', 'group', 'startYear', 'endYear', 'authorsStr', 'projectData'];
    },
    async selectData(itemData) {
        return _.pick(itemData, this.getFields());
    },
    validateProjectData(researchItem) {
        if (!researchItem)
            return false;

        return validate(researchItem.projectData);
    },
    validationErrors() {
        return validate.errors;
    },
    getUniquePartnerInstitutes: async function () {
        const queryPath = `api/queries/uniquePartnerInstitutes.sql`;
        const sql = SqlService.readQueryFromFs(queryPath);
        const results = await SqlService.query(sql);
        const institutes = results.map(r => r.institute);
        return institutes.sort();
    }
});
