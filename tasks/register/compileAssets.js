module.exports = function (grunt) {
	grunt.registerTask('compileAssets', [
		'clean:dev',
		'babel',
		'less:dev',
		'copy:dev'
	]);
};
