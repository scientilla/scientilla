/* global */
'use strict';

module.exports = {
    attributes: {
        project: {
            columnName: 'research_item',
            model: 'project',
            primaryKey: true
        },
        researchEntity: {
            columnName: 'research_entity',
            model: 'researchentity',
            primaryKey: true
        }
    },

    migrate: 'safe',
    tableName: 'suggestion_project',
    autoUpdatedAt: false,
    autoCreatedAt: false

};
