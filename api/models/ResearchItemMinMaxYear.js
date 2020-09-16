module.exports = {
    tableName: 'research_item_min_max_year',
    attributes: {
        research_entity: 'INTEGER',
        item_type: 'STRING',
        item_key: 'STRING',
        count: 'INTEGER',
        min: 'INTEGER',
        max: 'INTEGER'
    },
    autoUpdatedAt: false,
    autoCreatedAt: false
};
