module.exports = function (grunt) {
    grunt.config.set('jshint', {
        options: {
            curly: false,
            eqeqeq: true,
            eqnull: true,
            browser: true,
            esversion: 6,
            validthis: true,
            multistr: true,
            globals: {
                Promise: true,
                angular: true,
                _: true
            }
        },
        uses_defaults: ['assets/js/**/*.js']
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
};