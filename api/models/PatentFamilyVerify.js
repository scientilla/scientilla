/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        patentFamily: {
            columnName: 'patent_family',
            model: 'patentfamily'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
    },
    migrate: 'safe',
    tableName: 'patent_family_verify',
    autoUpdatedAt: false,
    autoCreatedAt: false
};