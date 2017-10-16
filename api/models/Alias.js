/*global Alias*/
"use strict";

_ = require('lodash');

module.exports = {

    attributes: {
        str: 'string',
        user: {
            model: 'user'
        }
    },
    addAlias: async function (userId, authorsStr, position) {
        const authors = authorsStr.split(', ');
        const newAlias = {user: userId, str: authors[position]};
        const alias = await Alias.find(newAlias);
        if (alias.length === 0)
            await Alias.create(newAlias);
    }
};

