module.exports = function (grunt) {
	grunt.registerTask('default',
        ['jshint', 'compileAssets', 'linkAssets',  'watch']
    );
};
