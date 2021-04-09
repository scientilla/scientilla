/* global */
'use strict';

module.exports = {
    attributes: {
        position: 'integer',
        authorStr: {
            columnName: 'author_str',
            type: 'string'
        },
        corresponding: 'boolean',
        firstCoauthor: {
            columnName: 'first_coauthor',
            type: 'boolean'
        },
        lastCoauthor: {
            columnName: 'last_coauthor',
            type: 'boolean'
        },
        oralPresentation: {
            columnName: 'oral_presentation',
            type: 'boolean'
        },
        project: {
            columnName: 'research_item',
            model: 'project'
        },
        verify: {
            model: 'projectverify'
        },
        affiliations: {
            collection: 'Institute',
            via: 'author',
            through: 'projectaffiliation'
        }
    },
    migrate: 'safe',
    tableName: 'author',
    autoUpdatedAt: false,
    autoCreatedAt: false
};