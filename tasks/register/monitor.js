const Sails = require('sails');

module.exports = function (grunt) {
    grunt.registerTask('monitor', function() {
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
