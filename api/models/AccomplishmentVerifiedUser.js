module.exports = {
    attributes: {
        accomplishment: {
            model: 'Accomplishment'
        },
        user: {
            model: 'User'
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment_verified_user',
    autoUpdatedAt: false,
    autoCreatedAt: false
};