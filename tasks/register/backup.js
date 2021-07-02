/* global Synchronizer, Cleaner, SourceMetric */
"use strict";
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

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