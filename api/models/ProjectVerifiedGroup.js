module.exports = {
    attributes: {
        project: {
            model: 'project'
        },
        group: {
            model: 'Group'
        }
    },
    migrate: 'safe',
    tableName: 'project_verified_group',
    autoUpdatedAt: false,
    autoCreatedAt: false
};