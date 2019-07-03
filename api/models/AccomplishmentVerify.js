/* global */
'use strict';

module.exports = {
    attributes: {
        public: 'BOOLEAN',
        favorite: 'BOOLEAN',
        accomplishment: {
            columnName: 'research_item',
            model: 'accomplishment'
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


