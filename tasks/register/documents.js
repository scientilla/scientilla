/* global Synchronizer, Cleaner, SourceMetric */
"use strict";
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

module.exports = function (grunt) {
    grunt.registerTask('documents', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            try {
                const methods = {
                    'clean': {
                        'copies': Cleaner.cleanDocumentCopies,
                        'institutes': Cleaner.cleanInstituteCopies,
                        'sources': Cleaner.cleanSourceCopies
                    },
                    'synchronize': {
                        'scopus': Synchronizer.synchronizeScopus,
                    },
                    'assignMetrics': SourceMetric.assignMetrics
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