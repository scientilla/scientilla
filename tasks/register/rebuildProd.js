module.exports = function (grunt) {
	grunt.registerTask('rebuildProd', [
		'recompileAssets',
		'concat',
		'uglify',
		'cssmin',
		'linkAssetsBuildProd',
		'clean:build',
		'copy:build'
	]);
};
