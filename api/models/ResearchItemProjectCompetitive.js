/* global require, ResearchItemProjectCompetitive, JsonValidator */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const validate = JsonValidator.getProjectCompetitiveValidator();

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_project_competitive',
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
    }
});
