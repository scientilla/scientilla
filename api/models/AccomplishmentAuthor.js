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
        accomplishment: {
            columnName: 'research_item',
            model: 'accomplishment'
        },
        verify: {
            model: 'accomplishmentverify'
        },
        affiliations: {
            collection: 'Institute',
            via: 'author',
            through: 'accomplishmentaffiliation'
        }
    },
    migrate: 'safe',
    tableName: 'author',
    autoUpdatedAt: false,
    autoCreatedAt: false
};