module.exports = {
    attributes: {
        group: {
            model: 'Group'
        },
        user: {
            model: 'User'
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