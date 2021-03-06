/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        patent: {
            columnName: 'research_item',
            model: 'patent'
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


