/* global require, ItemEditor, ResearchItem, Accomplishment, Validator */
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
    tableName: 'item_editor',
    attributes: {
        researchItem: {
            model: 'researchitem',
            columnName: 'research_item'
        },
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
                'title',
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
    getFields: function () {
        return fields.map(f => f.name);
    },
    selectData: function (draftData) {
        const documentFields = Document.getFields();
        return _.pick(draftData, documentFields);
    },
    async updateDraft(draft, itemData) {
        const selectedData = ItemEditor.selectData(itemData);
        selectedData.yearFrom = itemData.year;
        return ItemEditor.update({id: draft.id}, selectedData);
    },
    async getMergedItem(itemId) {
        return Accomplishment.findOne({id: itemId});
    }
});
