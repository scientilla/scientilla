/* global */
"use strict";

module.exports = {
    attributes: {
        author: {
            model: 'AccomplishmentAuthor'
        },
        institute: {
            model: 'Institute'
        },
        accomplishment:{
            model: 'Accomplishment'
        }
    },
    migrate: 'safe',
    tableName: 'accomplishment_affiliation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
