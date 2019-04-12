/* global require, ItemAward, Validator, Institute */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'year'},
    {name: 'affiliation'},
    {name: 'issuer'},
    {name: 'researchItem'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'item_award',
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
        affiliation: {
            model: 'institute'
        },
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
        if (itemData.affiliation)
            itemData.affiliation = await ItemAward.getFixedCollection(Institute, itemData.affiliation);
        return _.pick(itemData, ItemAward.getFields());
    }
});
