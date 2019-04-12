/* global require, ItemEventOrganization, Validator */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'year'},
    {name: 'eventType'},
    {name: 'place'},
    {name: 'description'},
    {name: 'researchItem'}
];

module.exports = _.merge({}, BaseModel, {
    tableName: 'item_event_organization',
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
        year: 'STRING',
        eventType: {
            type: 'STRING',
            columnName: 'event_type',
        },
        place: 'STRING',
        description: 'STRING',
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
        return _.pick(itemData, ItemEventOrganization.getFields());
    }
});
