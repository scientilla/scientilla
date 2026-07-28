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
    tableName: 'suggestion_training_module',
    autoUpdatedAt: false,
    autoCreatedAt: false

};