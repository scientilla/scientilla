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
        projectData: {
            type: 'JSON',
            columnName: 'project_data'
        },
        isValid: () => true,
    },
    getFields() {
        return ['researchItem', 'projectData'];
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
