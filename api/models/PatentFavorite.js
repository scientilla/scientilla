/* global */
'use strict';

module.exports = {
    attributes: {
        project: {
            columnName: 'research_item',
            model: 'patent',
            primaryKey: true
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'research_item_favorite',
    autoUpdatedAt: false,
    autoCreatedAt: false

};