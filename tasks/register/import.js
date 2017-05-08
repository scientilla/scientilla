const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('import', function(arg) {
        const done = this.async();
        Sails.load({}, async () => {
            try {
                const methods = {
                    'people': Importer.importPeople,
                    'groups': Importer.importGroups
                };
                const importTask = methods[arg];
                if (!_.isFunction(importTask)){
                    console.log('There is no option ' + arg);
                    console.log('Available options are ' + Object.keys(methods).join(', '));
                }
                else
                    await importTask();

            } catch (err) {
                console.log(err);
            }
            done();
        })
    });
};
