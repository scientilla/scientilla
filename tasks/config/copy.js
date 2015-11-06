/**
 * Copy files and folders.
 *
 * ---------------------------------------------------------------
 *
 * # dev task config
 * Copies all directories and files, exept coffescript and less fiels, from the sails
 * assets folder into the .tmp/public directory.
 *
 * # build task config
 * Copies all directories nd files from the .tmp/public directory into a www directory.
 *
 * For usage docs see:
 * 		https://github.com/gruntjs/grunt-contrib-copy
 */
module.exports = function (grunt) {

    grunt.config.set('copy', {
        dev: {
            files: [{
                    expand: true,
                    cwd: './assets',
                    src: ['**/*.!(coffee|less|html)'],
                    dest: '.tmp/public'
                }, {
                    expand: true,
                    cwd: './bower_components',
                    src: [
                        'angular/angular.min.js', 
                        'lodash/lodash.min.js', 
                        'angular-route/angular-route.min.js', 
                        'angular-resource/angular-resource.min.js',
                        'jquery/dist/jquery.min.js',
                        'bootstrap/dist/js/bootstrap.min.js',
                        'angular-material/angular-material.min.js',
                        'angular-animate/angular-animate.min.js',
                        'angular-aria/angular-aria.min.js',
                        'angular-form-for/dist/form-for.min.js',
                        'angular-form-for/dist/form-for.material-templates.js',
                        'restangular/dist/restangular.min.js',
                        'angular-material-icons/angular-material-icons.min.js',
                        'angular-sanitize/angular-sanitize.min.js'
                    ],
                    flatten: true,
                    dest: '.tmp/public/js/dependencies'
                }, {
                    expand: true,
                    cwd: './bower_components',
                    src: [
                        'bootstrap/dist/js/bootstrap.min.css',
                        'angular-material/angular-material.min.css',
                        'angular-form-for/angular-material.min.css'
//                        'angular-material-icons/angular-material-icons.css'
//                        'angular-animate/angular-animate.min.css',
//                        'angular-aria/angular-aria.min.css',
                    ],
                    flatten: true,
                    dest: '.tmp/public/styles/dependencies'
                },{
                    expand: true,
                    cwd: './assets',
                    src: ['js/app/*/*.html'],
                    flatten: true,
                    dest: '.tmp/public/partials'
                }]
        },
        build: {
            files: [{
                    expand: true,
                    cwd: '.tmp/public',
                    src: ['**/*'],
                    dest: 'www'
                }]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
};
