module.exports = {
    attributes: {
        group: {
            model: 'Group',
            primaryKey: true
        },
        user: {
            model: 'User',
            primaryKey: true
        },
        synchronized: 'boolean',
        active: 'boolean',
    },
    migrate: 'safe',
    tableName: 'subgroupsmembership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};