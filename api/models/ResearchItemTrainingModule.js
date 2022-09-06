/* global require, ResearchItemTrainingModule, Validator, JsonValidator, Institute */
'use strict';

const _ = require('lodash');
const BaseModel = require('../lib/BaseModel.js');
const validate = JsonValidator.getTrainingModuleValidator();

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_training_module',
    attributes: {
        researchItem: {
            model: 'researchitem',
            unique: true,
            columnName: 'research_item'
        },
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        referent: {
            model: 'user'
        },
        institute: {
            model: 'institute'
        },
        phdCourse: {
            model: 'phdcourse',
            columnName: 'phd_course'
        },
        title: 'STRING',
        year: 'STRING',
        issuer: 'STRING',
        description: 'STRING',
        hours: 'INTEGER',
        lectures: 'INTEGER',
        researchDomains: {
            type: 'JSON',
            columnName: 'research_domains'
        },
        location: 'STRING',
        delivery: 'STRING',
        isValid() {
            const requiredFields = [
                'title',
                'authorsStr',
                'year',
                'researchItem'
            ];

            validate(this)
            return _.every(requiredFields, v => this[v]) && Validator.hasValidAuthorsStr(this) && Validator.hasValidYear(this);
        },
    },
    getFields() {
        return [
            'researchItem',
            'authorsStr',
            'referent',
            'institute',
            'phdCourse',
            'title',
            'year',
            'issuer',
            'description',
            'hours',
            'lectures',
            'researchDomains',
            'location',
            'delivery'
        ];
    },
    validateData(researchItem) {
        if (!researchItem)
            return false;

        return validate(researchItem);
    },
    validationErrors() {
        return validate.errors;
    },
    prepare(data) {
        const preparedData = _.cloneDeep(data);
        preparedData.researchDomains = JSON.stringify(preparedData.researchDomains);
        if(!preparedData.researchDomains )
            delete preparedData.researchDomains
        return preparedData;
    },
    selectData(itemData) {
        return _.pick(itemData, ResearchItemTrainingModule.getFields());
    }
});
