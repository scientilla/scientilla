module.exports = {
    attributes: {
        trainingModule: {
            columnName: 'research_item',
            model: 'trainingmodule'
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