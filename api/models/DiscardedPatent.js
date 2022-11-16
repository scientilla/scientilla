/* global */
'use strict';

module.exports = {
    attributes: {
        patent: {
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
    tableName: 'discarded',
    autoUpdatedAt: false,
    autoCreatedAt: false

};
