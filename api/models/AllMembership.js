module.exports = {
    attributes: {
        user: {
            model: 'User'
        },
        group: {
            model: 'Group'
        },
        synchronized: 'boolean',
        active: 'boolean',
        child_group: {
            model: 'Group'
        },
        level: 'integer'
    },
    migrate: 'safe',
    tableName: 'all_membership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};