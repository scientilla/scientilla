/* global Importer, ExternalImporter, AgreementsImporter, MatrixImporter */
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

module.exports = function (grunt) {
    grunt.registerTask('import', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            const methods = {
                'sources': Importer.importSources,
                'sourcesMetrics': Importer.importSourceMetrics,
                'external': {
                    'user': ExternalImporter.updateUserExternal,
                    'group': ExternalImporter.updateGroupExternal,
                    'all': ExternalImporter.updateAllExternal,
                    'metadata': ExternalImporter.updateMetadata
                },
                'expired': UserImporter.removeExpiredUsers,
                'projects': Importer.importProjects,
                'patents': Importer.importPatents,
                'users': UserImporter.importUsers,
                'update-profile-groups': UserImporter.updateUserProfileGroups,
                'analyse-user-import': UserImporter.analyseUserImport,
                'agreements': Importer.importAgreements,
                'matrix': MatrixImporter.run,
            };

            try {
                const task = getMethod(args, methods);
                await task.method(...task.params);
            } catch (err) {
                sails.log.debug(err);
                sails.log.error('Available options are ' + Object.keys(methods).join(', '));
                done();
                return 1;
            }
            done();
        });
    });
};
