/* global */
"use strict";

module.exports = {
    attributes: {
        author: {
            model: 'PatentAuthor'
        },
        institute: {
            model: 'Institute'
        },
        patent:{
            columnName: 'research_item',
            model: 'Patent'
        }
    },
    migrate: 'safe',
    tableName: 'item_autor_affiliation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
