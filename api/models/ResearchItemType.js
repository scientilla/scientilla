/* global ItemAward, ItemEditor, ItemEventOrganization  */

module.exports = {
    tableName: 'research_item_type',
    attributes: {
        key: 'STRING',
        label: 'STRING',
        shortLabel: {
            type: 'STRING',
            columnName: 'short_label'
        },
        type: 'STRING',
    },
    getResearchItemModel(researchItemTypeKey) {
        const researchItemModels = {
            'award_achievement': ItemAward,
            'editor': ItemEditor,
            'organized_event': ItemEventOrganization,
        };

        return researchItemModels[researchItemTypeKey];
    }
};

