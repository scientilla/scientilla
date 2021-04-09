/* global */
"use strict";

module.exports = {
    attributes: {
        author: {
            model: 'projectauthor'
        },
        institute: {
            model: 'Institute'
        },
        project:{
            columnName: 'research_item',
            model: 'project'
        }
    },
    migrate: 'safe',
    tableName: 'item_autor_affiliation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
