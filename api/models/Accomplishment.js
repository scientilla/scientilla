/* global */
'use strict';


module.exports = {
    DEFAULT_SORTING: {
        year: 'desc',
        title: 'asc'
    },
    attributes: {
        title: 'STRING',
        authorsStr: {
            type: 'STRING',
            columnName: 'authors_str'
        },
        year: 'STRING',
        yearTo: {
            type: 'STRING',
            columnName: 'year_to'
        },
        affiliation: {
            model: 'institute'
        },
        issuer: 'STRING',
        medium: {
            model: 'source'
        },
        description: 'STRING',
        type: {
            model: 'researchitemtype'
        },
        kind: 'STRING',
        draftCreator: {
            model: 'researchentity',
            columnName: 'draft_creator'
        },
        verified: {
            collection: 'accomplishmentverify',
            via: 'accomplishment'
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment',
    autoUpdatedAt: false,
    autoCreatedAt: false
};


