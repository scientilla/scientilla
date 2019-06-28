module.exports = {
    attributes: {
        accomplishment: {
            model: 'accomplishment'
        },
        group: {
            model: 'Group'
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment_verified_group',
    autoUpdatedAt: false,
    autoCreatedAt: false
};