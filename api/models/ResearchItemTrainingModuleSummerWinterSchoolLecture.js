/* global require, ResearchItemTrainingModuleSummerWinterSchoolLecture, Validator, JsonValidator, Institute */
'use strict';

const _ = require('lodash');
const BaseModel = require('../lib/BaseModel.js');

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_training_module_summer_winter_school_lecture',
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
        wholeModule: {
            type: 'BOOLEAN',
            columnName: 'whole_module'
        },
        generalModuleTitle: {
            type: 'STRING',
            columnName: 'general_module_title'
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
        isValid() {
            const validate = JsonValidator.getTrainingModuleSummerWinterSchoolLectureValidator();
            const res = validate(this);
            if (!res) this.validationErrors = validate.errors;
            return res;
        },
        getValidationErrors() {
            return this.validationErrors;
        }
    },
    getFields() {
        return [
            'researchItem',
            'authorsStr',
            'referent',
            'wholeModule',
            'generalModuleTitle',
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
        return _.pick(itemData, ResearchItemTrainingModuleSummerWinterSchoolLecture.getFields());
    }
});
