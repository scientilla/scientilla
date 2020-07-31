/* global require */
'use strict';

module.exports = {
    migrate: 'safe',
    tableName: 'project_status',
    autoUpdatedAt: false,
    autoCreatedAt: false,
    attributes: {
        status: 'STRING',
    }
};