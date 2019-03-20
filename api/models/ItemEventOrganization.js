/* global require, ItemEventOrganization, ResearchItem, Accomplishment, Validator */
'use strict';

const BaseModel = require("../lib/BaseModel.js");

const fields = [
    {name: 'title'},
    {name: 'authorsStr'},
    {name: 'year'},
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
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    },
    async updateDraft(draft, itemData) {
        const selectedData = ItemEventOrganization.selectData(itemData);
        return ItemEventOrganization.update({id: draft.id}, selectedData);
    },
    async getMergedItem(itemId) {
        return Accomplishment.findOne({id: itemId});
    }
});
