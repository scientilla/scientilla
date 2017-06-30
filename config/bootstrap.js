/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
'use strict';
const _ = require('lodash');

module.exports.bootstrap = async function (cb) {
    const env = sails.config.environment;
    const isTest = env == 'test';
    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

    await initializeInstitutes();
    await initializeGroups();
    if (!isTest) {
        Cron.init();
        await Cron.start();
    }

    cb();

    function initializeInstitutes() {
        return Institute.count()
            .then(institutesNum => {
                if (institutesNum)
                    return;
                const instituteData = sails.config.scientilla.institute;
                sails.log.info('Creating institute ' + instituteData.name);
                return Institute.create(instituteData);
            });
    }

    function initializeGroups() {
        return Group.count()
            .then(groupsNum => {
                if (groupsNum)
                    return;
                const fields = ['name', 'shortname', 'scopusId'];
                const groupData = _.pick(sails.config.scientilla.institute, fields);
                sails.log.info('Creating group ' + groupData.name);
                return Group.create(groupData);
            });
    }
};
