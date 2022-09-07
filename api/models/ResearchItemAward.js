/* global require, ResearchItemAward, Validator, Institute */
'use strict';

const _ = require('lodash');
const BaseModel = require('../lib/BaseModel.js');

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'year'},
    {name: 'issuer'},
    {name: 'researchItem'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_award',
    attributes: {
        researchItem: {
            model: 'researchitem',
            unique: true,
            columnName: 'research_item'
        },
        title: 'STRING',
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        year: 'STRING',
        issuer: 'STRING',
        isValid() {
            const requiredFields = [
                'title',
                'authorsStr',
                'year',
                'researchItem'
            ];

            return _.every(requiredFields, v => this[v]) && Validator.hasValidAuthorsStr(this) && Validator.hasValidYear(this);
        },
    },
    getFields() {
        return fields.map(f => f.name);
    },
    async selectData(itemData) {
        return _.pick(itemData, ResearchItemAward.getFields());
    }
});
