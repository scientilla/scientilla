/* global Importer, ExternalImporter, AgreementsImporter */
const Sails = require('sails');
const getMethod = require('../taskHelper').getMethod;

module.exports = function (grunt) {
    grunt.registerTask('import', function (...args) {
        const done = this.async();
        Sails.load({hooks: {grunt: false}}, async () => {
            const methods = {
                'groups': Importer.importGroups,
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
                'directorates': Importer.importDirectorates,
                'users': UserImporter.importUsers,
                'update-profile-groups': UserImporter.updateUserProfileGroups,
                'analyse-user-import': UserImporter.analyseUserImport,
                'agreements': Importer.importAgreements
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