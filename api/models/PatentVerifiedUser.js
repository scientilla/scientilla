module.exports = {
    attributes: {
        patent: {
            columnName: 'research_item',
            model: 'patent'
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