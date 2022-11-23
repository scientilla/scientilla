"use strict";

_ = require('lodash');

module.exports = {
    attributes: {
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(self);
                });
            });
        }
    },
    getFixedCollection: async function (Model, collection) {

        async function checkCollection(c) {
            if (_.isNil(c))
                return undefined;
            if (_.isObject(c) && c.id)
                return c.id;
            if (parseInt(c, 10))
                return c;

            const newC = await Model.create(c);
            if (!newC)
                throw 'Invalid argument';

            return newC.id;
        }

        if (_.isArray(collection)) {
            const newCollection = [];

            for (const c of collection)
                newCollection.push(await checkCollection(c));

            return newCollection;
        }

        return await checkCollection(collection);
    },
    async blukAction(model, method, elements, params) {
        const results = [];
        for (const element of elements) {
            try {
                const res = await model[method].bind(model)(...[element, params]);
                results.push(res);
            } catch (e) {
                results.push(e);
            }
        }
        return results;
    }

};