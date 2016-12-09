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

module.exports.bootstrap = function (cb) {
    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    initializeInstitutes()
        .then(initializeGroups)
        .then(importDocuments)
        .then(_ => cb());

    function importDocuments(group) {
        if (_.isNil(group) || !sails.config.scientilla.mainInstituteImport.enabled)
            return;

        sails.log.info('Importing document from scopus ');
        return Importer.mainInstituteDocumentsImport();

    }

    function initializeGroups() {
        const fields = ['name', 'shortname', 'scopusId'];
        const groupData = _.pick(sails.config.scientilla.institute, fields);
        return Group.count()
            .then(groupsNum => {
                if (groupsNum)
                    return;
                sails.log.info('Creating group ' + groupData.name);
                return Group.create(groupData);
            });
    }

    function initializeInstitutes() {
        const instituteData = sails.config.scientilla.institute;
        return Institute.count()
            .then(institutesNum => {
                if (institutesNum)
                    return;
                sails.log.info('Creating institute ' + instituteData.name);
                return Institute.create(instituteData);
            })
    }
};
