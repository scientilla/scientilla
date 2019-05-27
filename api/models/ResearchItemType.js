/* global ResearchItemTypes, Accomplishment  */

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
    getResearchItemChildModel(type) {
        const researchItemModels = {
            'award_achievement': Accomplishment,
            'editorship': Accomplishment,
            'organized_event': Accomplishment,
        };

        const researchItemType = ResearchItemTypes.getType(type);
        return researchItemModels[researchItemType.key];
    }
};

