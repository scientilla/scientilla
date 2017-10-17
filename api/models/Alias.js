/*global Alias*/
"use strict";

_ = require('lodash');

module.exports = {

    attributes: {
        str: 'string',
        user: {
            model: 'user',
            required: true
        }
    },
    addAlias: async function (userId, authorsStr, position) {
        const authors = authorsStr.split(', ');
        const newAlias = {user: userId, str: authors[position]};
        const alias = await Alias.find(newAlias);
        if (alias.length === 0)
            await Alias.create(newAlias);
    },
    createOrUpdateAll: async function (userId, newAliases) {
        const currentAliases = await Alias.find({user: userId});
        const newAliasesStr = newAliases.map(a => a.str);
        const currentAliasesStr = currentAliases.map(a => a.str);

        const toDelete = currentAliases.reduce((acc, value) => {
            if (!newAliasesStr.includes(value.str))
                acc.push(value);
            return acc;
        }, []);
        const toCreate = newAliases.reduce((acc, value) => {
            if (!currentAliasesStr.includes(value.str))
                acc.push({
                    user: userId,
                    str: value.str
                });
            return acc;
        }, []);

        if (toDelete.length)
            await Alias.destroy({id: toDelete.map(td => td.id)});
        if (toCreate.length)
            await Alias.create(toCreate);
    }
};

