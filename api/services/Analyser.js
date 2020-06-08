/* global Utils, User, Importer, Authorship, ResearchEntity */

// Analyser.js - in api/services

"use strict";

module.exports = {
    searchScientillaUsersInActiveDirectory,
    searchForGovAndControlUsers,
    searchForUsersWithoutDocumentsAndAccomplishments
};

async function searchScientillaUsersInActiveDirectory() {

    const ldapUsers = await Utils.getActiveDirectoryUsers();
    const users = await User.find({}).where({
        or: [
            { role: 'administrator' },
            { role: 'user' }
        ]
    });
    const notFoundUsers = [];

    for (const user of users) {
        if (!_.isEmpty(user.username)) {
            const found = ldapUsers.find(
                ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(user.username)
            );

            if (_.isEmpty(found)) {
                sails.log.debug('Not found in LDAP: ' + user.username);
                notFoundUsers.push(user);
            }
        }
    }

    sails.log.debug('There are ' + notFoundUsers.length + ' users that don\'t  exist in the Active Directory.');
}

// Change to find not delete
async function searchForGovAndControlUsers() {
    const options = Importer.getEmployeesRequestOptions();
    const employees = await Importer.getEmployees(options);
    const boardEmployees = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea === 'Gov. & Control');
    const foundUsers = [];

    for (const employee of boardEmployees) {
        let user;

        if (_.has(employee, 'cid')) {
            user = await User.findOne({ cid: employee.cid });
        }

        if (!user && _.has(employee, 'email') && !_.isEmpty(employee.email)) {
            user = await User.findOne({ username: employee.email });
        }

        if (user) {
            sails.log.debug('Found a user in Scientilla that should not be there: ' + user);
            foundUsers.push(user);
        }
    }

    sails.log.debug('There are ' + foundUsers.length + ' users that shouldn\'t be in the database.');
}

async function searchForUsersWithoutDocumentsAndAccomplishments() {
    const usersWithDocuments = [];
    const usersWithoutDocuments = [];
    const usersWithAccomplishments = [];
    const usersWithoutAccomplishments = [];

    const users = await User.find();

    for (const u of users) {
        const user = await User.findOne({ id: u.id }).populate('documents');
        if (user.documents.length > 0) {
            usersWithDocuments.push(user.id);
        } else {
            usersWithoutDocuments.push(user.id);
        }
    }

    const researchEntities = await ResearchEntity.find({ type: 'user' });
    for (const r of researchEntities) {
        const researchEntity = await ResearchEntity.findOne({ id: r.id }).populate(['user', 'accomplishments']);
        if (_.isNil(researchEntity.user[0]) || _.isNil(researchEntity.user[0].id)) {
            continue;
        }

        if (researchEntity.accomplishments.length > 0) {
            usersWithAccomplishments.push(researchEntity.user[0].id);
        } else {
            usersWithoutAccomplishments.push(researchEntity.user[0].id);
        }
    }

    const userIdsWithoutDocumentsAndAccomplishments = usersWithoutDocuments.filter(
        id => usersWithoutAccomplishments.includes(id)
    );

    sails.log.debug('Found ' + userIdsWithoutDocumentsAndAccomplishments.length + ' without any documents and accomplishments');

    await User.destroy({ id: userIdsWithoutDocumentsAndAccomplishments });

    return userIdsWithoutDocumentsAndAccomplishments;
}