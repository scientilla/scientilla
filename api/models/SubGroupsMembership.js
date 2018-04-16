module.exports = {
    attributes: {
        group: {
            model: 'Group',
            primaryKey: true
        },
        user: {
            model: 'User',
            primaryKey: true
        }
    },
    migrate: 'safe',
    tableName: 'subgroupsmembership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};