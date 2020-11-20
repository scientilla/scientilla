/**
 * Membership.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {
    attributes: {
        user: {
            model: 'user'
        },
        group: {
            model: 'Group'
        },
        lastsynch: 'datetime',
        active: 'boolean',
        synchronized: 'boolean'
    },
    migrate: 'safe',
    tableName: 'active_membership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};

