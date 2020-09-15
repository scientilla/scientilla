module.exports = {
    attributes: {
        accomplishment: {
            columnName: 'research_item',
            model: 'accomplishment'
        },
        group: {
            model: 'Group'
        }
    },
    migrate: 'safe',
    tableName: 'verified_group',
    autoUpdatedAt: false,
    autoCreatedAt: false
};