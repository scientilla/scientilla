/* global Synchronizer, Cleaner, SourceMetric */
"use strict";
const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('backup', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            try {
                const methods = {
                    'create': Backup.makeManualBackup,
                    'restore': Backup.restoreBackup
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
        if (_.isFunction(method)) {
            params.push(a);
            continue;
        }

        if (_.isFunction(tree[a])) {
            method = tree[a];
            continue;
        }

        if (_.isObject(tree[a]))
            tree = tree[a];
    }

    if (_.isFunction(method))
        return {
            method,
            params
        };

    throw 'wrong parameters ' + args.join(':');
}