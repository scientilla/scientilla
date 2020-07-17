/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        project: {
            columnName: 'research_item',
            model: 'publiccompetitiveproject'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
    },
    migrate: 'safe',
    tableName: 'public_project_verify',
    autoUpdatedAt: false,
    autoCreatedAt: false
};