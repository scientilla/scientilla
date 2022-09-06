module.exports = {
    attributes: {
        trainingModule: {
            columnName: 'research_item',
            model: 'trainingmodule'
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