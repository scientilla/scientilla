const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('tmp', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            try {
                await Tmp[args[0]](...args.slice(1));
            } catch (err) {
                sails.log.debug(err);
                done();
                return 1;
            }
            done();
        });
    });
};