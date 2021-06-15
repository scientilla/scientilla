/*global Alias*/
"use strict";

_ = require('lodash');

module.exports = {

    attributes: {
        str: 'string',
        user: {
            model: 'user',
            required: true
        },
        main: {
            type: "BOOLEAN",
            defaultsTo: false
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

        const mainAliases = newAliases.filter(a => a.main === true);
        if (mainAliases.length === 0) {
            throw 'No main alias!';
        }

        if (mainAliases.length > 1) {
            throw 'Got more than one main alias!';
        }

        const toDelete = currentAliases.reduce((acc, value) => {
            if (!newAliasesStr.includes(value.str))
                acc.push(value);
            return acc;
        }, []);

        const toCreate = newAliases.reduce((acc, value) => {
            if (!currentAliasesStr.includes(value.str))
                acc.push({
                    user: userId,
                    str: value.str,
                    main: value.main
                });
            return acc;
        }, []);

        const toUpdate = newAliases.reduce((acc, value) => {
            const alias = currentAliases.find(a => a.str === value.str && a.main !== value.main);
            if (alias)
                acc.push({
                    user: userId,
                    str: value.str,
                    main: value.main
                });
            return acc;
        }, []);

        if (toDelete.length) {
            await Alias.destroy({id: toDelete.map(td => td.id)});
        }

        if (toCreate.length) {
            await Alias.create(toCreate);
        }

        if (toUpdate.length) {
            for (const record of toUpdate) {
                await Alias.update({user: record.user, str: record.str}, record);
            }
        }
    }
};

