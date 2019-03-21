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
            model: 'accomplishment'
        },
        verify: {
            model: 'accomplishmentverify'
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment_author',
    autoUpdatedAt: false,
    autoCreatedAt: false
};