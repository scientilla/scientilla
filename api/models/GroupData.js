
/* global ResearchEntityData, Group */

"use strict";

const path = require('path');

module.exports = {
    attributes: {
        profile: 'JSON',
        importedData: {
            columnName: 'imported_data',
            type: 'JSON'
        },
        group: {
            model: 'group'
        },
        active: {
            type: 'BOOLEAN',
            defaultsTo: true
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchEntity',
            unique: true
        },
    },
    migrate: 'safe',
    tableName: 'group_data',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
