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
        child_group: {
            model: 'Group'
        },
        level: 'integer'
    },
    migrate: 'safe',
    tableName: 'allmembership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};