/* global */
'use strict';

module.exports = {
    attributes: {
        trainingModule: {
            columnName: 'research_item',
            model: 'trainingmodule',
            primaryKey: true
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'discarded',
    autoUpdatedAt: false,
    autoCreatedAt: false

};