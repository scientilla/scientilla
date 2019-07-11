/* global */
'use strict';

module.exports = {
    attributes: {
        accomplishment: {
            columnName: 'research_item',
            model: 'accomplishment',
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