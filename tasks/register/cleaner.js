/* global Cleaner */
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

module.exports = function (grunt) {
    grunt.registerTask('cleaner', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            const methods = {
                'accessLogs': Cleaner.cleanAccessLogs,
                'logFiles': Cleaner.cleanLogFiles
            };

            try {
                const task = getMethod(args, methods);
                await task.method(...task.params);
            } catch (err) {
                sails.log.debug(err);
                sails.log.error('Available options are ' + Object.keys(methods).join(', '));
                done();
                return 1;
            }
            done();
        });
    });
};
