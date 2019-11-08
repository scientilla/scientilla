module.exports = function(grunt) {
    var config = require('../../config/customizations.js');

    if (config && config.customizations && config.customizations.styles && config.customizations.styles.stylesArray) {
        grunt.config.set('replace', {
            dist: {
                options: {
                    patterns: config.customizations.styles.stylesArray,
                    prefix: '#'
                },
                files: [
                    {
                        src: 'assets/styles/variables.scss',
                        dest: 'assets/styles/variables-overwrites.scss'
                    }
                ]
            }
        });

        grunt.loadNpmTasks('grunt-replace');
    }
};