/* global require, ResearchItemTrainingModule, Validator, JsonValidator, Institute */
'use strict';

const _ = require('lodash');
const BaseModel = require('../lib/BaseModel.js');

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
        otherCourse: {
            type: 'BOOLEAN',
            columnName: 'other_course'
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
        description: 'STRING',
        hours: 'INTEGER',
        lectures: 'INTEGER',
        researchDomains: {
            type: 'JSON',
            columnName: 'research_domains'
        },
        location: 'STRING',
        delivery: 'STRING',
        async isValid() {
            const validate = JsonValidator.getTrainingModuleValidator();
            const res = validate(this);
            if (!res) this.validationErrors = validate.errors;
            return res;
        }
    },
    getFields() {
        return [
            'researchItem',
            'authorsStr',
            'referent',
            'otherCourse',
            'institute',
            'phdCourse',
            'title',
            'year',
            'description',
            'hours',
            'lectures',
            'researchDomains',
            'location',
            'delivery'
        ];
    },
    prepare(data) {
        const preparedData = _.cloneDeep(data);
        preparedData.researchDomains = JSON.stringify(preparedData.researchDomains);
        if (!preparedData.researchDomains)
            delete preparedData.researchDomains
        return preparedData;
    },
    selectData(itemData) {
        return _.pick(itemData, ResearchItemTrainingModule.getFields());
    }
});
