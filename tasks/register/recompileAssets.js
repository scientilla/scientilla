module.exports = function (grunt) {
	grunt.registerTask('recompileAssets', [
		'sass-replace',
		'sass:dev',
		'copy:dev'
	]);
};
