module.exports = function(grunt) {
    var config = require('../../config/customizations.js');

    if (config && config.customizations && config.customizations.styles && config.customizations.styles.stylesArray) {

        grunt.config.set('sass-replace', {
            default: {
                files: [
                    {
                        src: 'assets/styles/variables.scss',
                        dest: 'assets/styles/variables-overwrites.scss'
                    }
                ],
                options: {
                    variables: config.customizations.styles.stylesArray
                }
            }
        });

        grunt.loadNpmTasks('grunt-sass-replace');
    }
};