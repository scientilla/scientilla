/* global ExternalImporter */
"use strict";
const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('documents', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            try {
                const methods = {
                    'synchronize': {
                        'scopus': Synchronizer.synchronizeScopus,
                    },
                    'clean': {
                        'copies': Cleaner.cleanDocumentCopies,
                        'institutes': Cleaner.cleanInstituteCopies,
                        'sources': Cleaner.cleanSourceCopies
                    }
                };

                const task = getMethod(args, methods);
                await task.method(...task.params);

            } catch (err) {
                sails.log.debug(err);
                done();
                return 1;
            }
            done();
        });
    });
};

function getMethod(args, methods) {
    let tree = methods;
    let method = null;
    let params = [];

    for (let a of args) {
        if (_.isFunction(method))
            params.push(a);

        if (_.isFunction(tree[a]))
            method = tree[a];

        if (_.isObject(tree[a]))
            tree = tree[a];
    }

    if (_.isFunction(method))
        return {
            method,
            params
        };

    throw 'wrong parameters';
}
