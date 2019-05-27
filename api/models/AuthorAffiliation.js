/* global */
"use strict";

module.exports = {
    tableName: 'author_affiliation',
    attributes: {
        author: {
            model: 'Author'
        },
        institute: {
            model: 'Institute'
        }
    }
};
