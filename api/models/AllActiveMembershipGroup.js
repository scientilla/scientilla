module.exports = {
    attributes: {
        group: {
            model: 'Group'
        },
        user: {
            model: 'User'
        }
    },
    migrate: 'safe',
    tableName: 'all_active_membership_group',
    autoUpdatedAt: false,
    autoCreatedAt: false
};