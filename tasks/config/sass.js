module.exports = function(grunt) {

  const sass = require('node-sass');

  grunt.config.set('sass', {
    dev: {
      options: {
        implementation: sass,
        sourceMap: true
      },
      files: [{
        expand: true,
        cwd: 'assets/styles/',
        src: ['scientilla.scss'],
        dest: '.tmp/public/styles/',
        ext: '.css'
      }]
    }
  });
};