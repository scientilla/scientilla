/* global require, ResearchItemPatent, JsonValidator */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const validatePatent = JsonValidator.getPatentValidator();
const validatePatentFamily = JsonValidator.getPatentFamilyValidator();

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_patent',
    attributes: {
        researchItem: {
            model: 'researchitem',
            columnName: 'research_item',
            unique: true
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        code: {
            type: 'STRING',
        },
        patentFamilyData: {
            type: 'JSON',
            columnName: 'patent_family_data'
        },
        patentData: {
            type: 'JSON',
            columnName: 'patent_data'
        },
        isValid: () => true,
    },
    getFields() {
        return ['researchItem', 'authorsStr', 'code', 'patentFamilyData', 'patentData'];
    },
    async selectData(itemData) {
        return _.pick(itemData, this.getFields());
    },
    validatePatentData(researchItem) {
        if (!researchItem)
            return false;

        return validatePatentFamily(researchItem.patentFamilyData) && validatePatent(researchItem.patentData);
    },
    validationErrors() {
        return {
            patentFamily: validatePatentFamily.errors,
            patent: validatePatent.errors
        };
    }
});
