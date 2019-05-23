/* global require, ResearchItemEditorship, Validator, Source */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'yearFrom'},
    {name: 'yearTo'},
    {name: 'source'},
    {name: 'editorshipRole'},
    {name: 'researchItem'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'research_item_editorship',
    attributes: {
        researchItem: {
            model: 'researchitem',
            columnName: 'research_item'
        },
        title: 'STRING',
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        yearFrom: {
            type: 'STRING',
            columnName: 'year_from'
        },
        yearTo: {
            type: 'STRING',
            columnName: 'year_to'
        },
        source: {
            model: 'source'
        },
        editorshipRole: {
            type: 'STRING',
            columnName: 'editorship_role',
        },
        isValid() {
            const requiredFields = [
                'authorsStr',
                'yearFrom',
                'source',
                'researchItem'
            ];

            return _.every(requiredFields, v => this[v])
                && Validator.hasValidAuthorsStr(this)
                && Validator.hasValidYear(this, 'yearFrom')
                && (!this.yearTo || Validator.hasValidYear(this, 'yearTo'));
        },
    },
    getFields() {
        return fields.map(f => f.name);
    },
    async selectData(itemData) {
        if (!itemData.yearFrom)
            itemData.yearFrom = itemData.year;
        if (itemData.source)
            itemData.source = await ResearchItemEditorship.getFixedCollection(Source, itemData.source);
        return _.pick(itemData, ResearchItemEditorship.getFields());
    }
});
