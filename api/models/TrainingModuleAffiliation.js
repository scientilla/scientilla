/* global */
"use strict";

module.exports = {
    attributes: {
        author: {
            model: 'TrainingModuleAuthor'
        },
        institute: {
            model: 'Institute'
        },
        accomplishment: {
            columnName: 'research_item',
            model: 'trainingmodule'
        }
    },
    migrate: 'safe',
    tableName: 'item_autor_affiliation',
    autoUpdatedAt: false,
    autoCreatedAt: false
};
