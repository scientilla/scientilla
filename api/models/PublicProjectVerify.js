/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        project: {
            columnName: 'research_item',
            model: 'publicproject'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
    },
    migrate: 'safe',
    tableName: 'verify',
    autoUpdatedAt: false,
    autoCreatedAt: false
};