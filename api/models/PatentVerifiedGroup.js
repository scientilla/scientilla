module.exports = {
    attributes: {
        patent: {
            columnName: 'research_item',
            model: 'patent'
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