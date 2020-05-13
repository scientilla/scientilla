module.exports = {
    attributes: {
        project: {
            model: 'project'
        },
        user: {
            model: 'User'
        }
    },
    migrate: 'safe',
    tableName: 'project_verified_user',
    autoUpdatedAt: false,
    autoCreatedAt: false
};