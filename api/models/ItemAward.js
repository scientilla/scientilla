/* global require, ItemAward, ResearchItem, Accomplishment, Validator, Institute */
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
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        return _.pick(draftData, ItemAward.getFields());
    },
    async createDraft(itemData) {
        const selectedData = ItemAward.selectData(itemData);
        if (itemData.affiliation)
            selectedData.affiliation = await ItemAward.getFixedCollection(Institute, itemData.affiliation);
        return ItemAward.create(selectedData);
    },
    async updateDraft(draft, itemData) {
        const selectedData = ItemAward.selectData(itemData);
        if (itemData.affiliation)
            selectedData.affiliation = await ItemAward.getFixedCollection(Institute, itemData.affiliation);
        return ItemAward.update({id: draft.id}, selectedData);
    },
    async getMergedItem(itemId) {
        return Accomplishment.findOne({id: itemId});
    }
});
