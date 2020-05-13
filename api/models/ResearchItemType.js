/* global ResearchItemTypes, Accomplishment, Project  */

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
    }
};

