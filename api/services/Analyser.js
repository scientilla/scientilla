/* global Utils, User, Importer, Authorship, ResearchEntity */

// Analyser.js - in api/services

"use strict";

module.exports = {
    searchScientillaUsersInActiveDirectory,
    searchForUsersWithWrongPentahoEmail,
    searchForGovAndControlUsers
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

async function searchForUsersWithWrongPentahoEmail() {
    const options = ImportHelper.getUserImportRequestOptions('employees');
    let employees = await ImportHelper.getEmployees(options);

    employees = ImportHelper.filterEmployees(employees);

    const ldapUsers = await Utils.getActiveDirectoryUsers();

    const notFoundEmployees = [];

    for (const employee of employees) {
        const found = ldapUsers.find(
            ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(employee.email)
        );

        if (_.isEmpty(found)) {
            sails.log.debug(`Not found in LDAP: ${employee.email} ${employee.nome} ${employee.cognome}`);
            notFoundEmployees.push(employee);
        }
    }
    sails.log.debug(notFoundEmployees.length);
}

// Change to find not delete
async function searchForGovAndControlUsers() {
    const options = ImportHelper.getUserImportRequestOptions('employees');
    const employees = await ImportHelper.getEmployees(options);
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
            sails.log.debug(`Found a user in Scientilla that should not be there: ${user.username} ${user.name} ${user.surname}`);
            foundUsers.push(user);
        }
    }

    sails.log.debug('There are ' + foundUsers.length + ' users that shouldn\'t be in the database.');
}