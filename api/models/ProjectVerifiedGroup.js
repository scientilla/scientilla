module.exports = {
    attributes: {
        project: {
            columnName: 'research_item',
            model: 'project'
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