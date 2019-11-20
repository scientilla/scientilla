module.exports = function (grunt) {
	grunt.registerTask('recompileAssets', [
		'replace',
		'sass:dev',
		'copy:dev'
	]);
};
