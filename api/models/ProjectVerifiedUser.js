module.exports = {
    attributes: {
        project: {
            columnName: 'research_item',
            model: 'project'
        },
        user: {
            model: 'User'
        }
    },
    migrate: 'safe',
    tableName: 'verified_user',
    autoUpdatedAt: false,
    autoCreatedAt: false
};