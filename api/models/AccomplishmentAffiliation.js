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
            columnName: 'research_item',
            model: 'Accomplishment'
        }
    },
    migrate: 'safe',
    tableName: 'item_autor_affiliation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
