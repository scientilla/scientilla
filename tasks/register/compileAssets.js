module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'babel',
		'sass-replace',
		'sass:dev',
		'copy:dev',
		'copy:uploadsDev'
	]);
};
