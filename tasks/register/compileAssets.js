module.exports = function (grunt) {
    grunt.registerTask('compileAssets', [
        'clean:dev',
        'babel',
        'replace',
        'sass:dev',
        'copy:dev',
        'copy:uploadsDev',
        'copy:profileDev'
    ]);
};
