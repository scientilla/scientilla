/* global Analyser */
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

module.exports = function (grunt) {
    grunt.registerTask('analyse', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            const methods = {
                'ldap': Analyser.searchScientillaUsersInActiveDirectory,
                'gov': Analyser.searchForGovAndControlUsers,
                'pentaho': Analyser.searchForUsersWithWrongPentahoEmail
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