const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('monitor', function(arg) {
        const done = this.async();
        Sails.load({hooks: { grunt: false}}, async () => {
            try {
                await Monitor.snap();

            } catch (err) {
                sails.log.debug(err);
                done();
                return 1;
            }
            done();
        });
    });
};
