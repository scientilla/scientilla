/* global */
'use strict';

module.exports = {
    attributes: {
        person: {
            columnName: 'user',
            model: 'person'
        },
        group: {
            columnName: 'group',
            model: 'Group'
        },
    },
    migrate: 'safe',
    tableName: 'membership',
    autoUpdatedAt: false,
    autoCreatedAt: false
};