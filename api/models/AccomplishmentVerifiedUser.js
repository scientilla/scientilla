module.exports = {
    attributes: {
        accomplishment: {
            columnName: 'research_item',
            model: 'Accomplishment'
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