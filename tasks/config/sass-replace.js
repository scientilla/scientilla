module.exports = function(grunt) {
    //var done = this.async();

    var variables = [
        {
            name: 'test',
            //from: 'rgb(0,114,175)',
            to: 'red'
        }
    ];

    var config = require('../../config/customizations.js');

    //console.log(config.customizations);

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
};