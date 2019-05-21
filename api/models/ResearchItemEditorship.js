/* global require, ResearchItemEditorship, Validator, Source */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'yearFrom'},
    {name: 'yearTo'},
    {name: 'medium'},
    {name: 'editorInChief'},
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
        medium: {
            model: 'source'
        },
        editorInChief: {
            type: 'BOOLEAN',
            columnName: 'editor_in_chief',
        },
        isValid() {
            const requiredFields = [
                'authorsStr',
                'yearFrom',
                'medium',
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
        if (itemData.medium)
            itemData.medium = await ResearchItemEditorship.getFixedCollection(Source, itemData.medium);
        return _.pick(itemData, ResearchItemEditorship.getFields());
    }
});
