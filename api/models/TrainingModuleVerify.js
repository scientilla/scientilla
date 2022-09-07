/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        trainingModule: {
            columnName: 'research_item',
            model: 'trainingmodule'
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