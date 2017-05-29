const Sails = require('sails');
const _ = require('lodash');

module.exports = function (grunt) {
    grunt.registerTask('synchronization', function(arg) {
        const done = this.async();
        Sails.load({hooks: { grunt: false}}, async () => {
            try {
                const methods = {
                    'scopus': Synchronizer.synchronizeScopus
                };
                const importTask = methods[arg];
                if (!_.isFunction(importTask)){
                    sails.log.error('There is no option ' + arg)
                    sails.log.error('Available options are ' + Object.keys(methods).join(', '));
                }
                else
                    await importTask();

            } catch (err) {
                sails.log.debug(err);
                done();
                return 1;
            }
            done();
        });
    });
};
