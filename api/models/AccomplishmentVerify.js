/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        accomplishment: {
            model: 'accomplishment'
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity'
        },
    },
    migrate: 'safe',
    tableName: 'accomplishment_verify',
    autoUpdatedAt: false,
    autoCreatedAt: false
};


