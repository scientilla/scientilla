/* global Importer, ExternalImporter, AgreementsImporter */
const Sails = require('sails');

module.exports = function (grunt) {
    grunt.registerTask('taskRunner', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            try {
                await GruntTaskRunner.run(args.join(':'));
            } catch (err) {
                sails.log.debug(err);
                done();
                return 1;
            }
            done();
        });
    });
};
