/* global Utils, User, ImportHelper, Authorship, ResearchEntity */

// Analyser.js - in api/services

"use strict";

module.exports = {
    searchScientillaUsersInActiveDirectory,
    searchForGovAndControlUsers,
    searchForUsersWithoutDocumentsAndAccomplishments,
    checkContractEndDates,
    specialCase
};

const defaultEmail = 'all';

const moment = require('moment');
moment.locale('en');

/**
 * Search for users in the Active Directory
 */
async function searchScientillaUsersInActiveDirectory() {

    const ldapUsers = await Utils.getActiveDirectoryUsers();
    const users = await User.find({}).where({
        or: [
            {role: 'administrator'},
            {role: 'user'}
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

/**
 * Search for users in Pentaho with desc_sottoarea === 'Gov. & Control'
 */
async function searchForGovAndControlUsers() {
    const options = ImportHelper.getEmployeesRequestOptions();
    const employees = await ImportHelper.getEmployees(options);
    const boardEmployees = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea === 'Gov. & Control');
    const foundUsers = [];

    for (const employee of boardEmployees) {
        let user;

        if (_.has(employee, 'cid')) {
            user = await User.findOne({cid: employee.cid});
        }

        if (!user && _.has(employee, 'email') && !_.isEmpty(employee.email)) {
            user = await User.findOne({username: employee.email});
        }

        if (user) {
            sails.log.debug('Found a user in Scientilla that should not be there: ' + user);
            foundUsers.push(user);
        }
    }

    sails.log.debug('There are ' + foundUsers.length + ' users that shouldn\'t be in the database.');
}
/**
 * Search for users without documents and accomplishments
 */
async function searchForUsersWithoutDocumentsAndAccomplishments() {
    const usersWithoutDocuments = [];
    const usersWithoutAccomplishments = [];

    const users = await User.find({role: 'user'});

    for (const u of users) {
        const user = await User.findOne({id: u.id}).populate('documents');
        if (user.documents.length === 0) {
            usersWithoutDocuments.push(user.id);
        }
    }

    const researchEntities = await ResearchEntity.find({type: 'user'});
    for (const r of researchEntities) {
        const researchEntity = await ResearchEntity.findOne({id: r.id}).populate(['user', 'accomplishments']);
        if (
            _.isNil(researchEntity.user[0]) ||
            _.isNil(researchEntity.user[0].id) ||
            _.isNil(researchEntity.user[0].role) ||
            researchEntity.user[0].role !== 'user'
        ) {
            continue;
        }

        if (researchEntity.accomplishments.length === 0) {
            usersWithoutAccomplishments.push(researchEntity.user[0].id);
        }
    }

    const userIdsWithoutDocumentsAndAccomplishments = usersWithoutDocuments.filter(
        id => usersWithoutAccomplishments.includes(id)
    );

    sails.log.debug('Found ' + userIdsWithoutDocumentsAndAccomplishments.length +
        ' users (with role=\'user\') without any documents and accomplishments');

    return userIdsWithoutDocumentsAndAccomplishments;
}

/**
 * Compare the contract end dates received from Pentaho and in database
 */
async function checkContractEndDates(email = defaultEmail) {
    const moment = require('moment');
    moment.locale('en');

    const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';

    const reqOptionsEmployees = ImportHelper.getEmployeesRequestOptions();
    reqOptionsEmployees.params.statodip = 'tutti';
    reqOptionsEmployees.params.email = email;

    let employees = await ImportHelper.getEmployees(reqOptionsEmployees);

    // Get all CID codes in one Array
    const cidCodes = employees.map(employee => employee.cid);

    // Get the contractual history of the CID codes
    const contracts = await ImportHelper.getContractualHistoryOfCidCodes(cidCodes);

    for (const contract of contracts) {
        if (contract.contratto_secondario !== 'X') {
            const employee = employees.find(e => e.cid === contract.cid);
            if (_.has(contract, 'step')) {
                if (!_.has(employee, 'contract')) {
                    employee.contract = [contract];
                } else {
                    employee.contract.push(contract);
                }
            }
        }
    }

    // Only keep the employees with a contract
    employees = employees.filter(e => _.has(e, 'contract'));

    // Merge the duplicate employees
    employees = ImportHelper.mergeDuplicateEmployees(employees);

    sails.log.debug(employees.length);

    const wrongEndDates = [];

    for (const employee of employees) {
        sails.log.info('-----------------------------------------------------------------');

        const contract = _.head(employee.contract);
        const handledSteps = [];

        // Check if the contract has a step and a cid
        if (
            _.has(contract, 'step') &&
            _.has(contract, 'cid')
        ) {
            const steps = contract.step;

            // Check if there are more steps
            if (_.isArray(steps)) {
                sails.log.info('Contract has ' + steps.length + ' steps');

                // Loop over the steps
                for (const step of steps) {

                    // Handle the step
                    const handledStep = ImportHelper.handleStep(step);

                    // Ignore the step if it doesn't have a from, jobTitle or line property
                    if (
                        !_.has(handledStep, 'from') ||
                        !_.has(handledStep, 'jobTitle') ||
                        !_.has(handledStep, 'lines')
                    ) {
                        continue;
                    }

                    let sameHandledStepIndex;

                    // We look if the user has already step with the same group and role
                    if (_.isArray(handledStep.lines)) {
                        sameHandledStepIndex = handledSteps.findIndex(
                            s => s.jobTitle === handledStep.jobTitle &&
                                JSON.stringify(s.lines) === JSON.stringify(handledStep.lines)
                        );
                    }

                    // If that's the case: we check if we can merge it together
                    if (sameHandledStepIndex !== -1) {
                        const handledStepOfIndex = handledSteps[sameHandledStepIndex];

                        // We concatenate the from or to date if they are following each other up.
                        switch (true) {
                            case moment(handledStep.from, ISO8601Format).diff(
                                moment(handledStepOfIndex.to, ISO8601Format), 'days'
                            ) === 1:
                                // When the start date of the new step is one day after the end date of the found step
                                // We check if the found step has an end date.
                                if (handledStep.to) {
                                    // If yes, we override the end date of the new step
                                    handledStepOfIndex.to = handledStep.to;
                                } else {
                                    // If not we delete the end date
                                    delete handledStepOfIndex.to;
                                }
                                // we override the existing step
                                handledSteps[sameHandledStepIndex] = handledStepOfIndex;
                                break;
                            case moment(handledStepOfIndex.from, ISO8601Format).diff(
                                moment(handledStep.to, ISO8601Format), 'days'
                            ) === 1:
                                // When the end date of the new step is one day before the begin date of the found step
                                // We set the start date of the found step to the start date of the new step.
                                handledStepOfIndex.from = handledStep.from;
                                // we override the existing step
                                handledSteps[sameHandledStepIndex] = handledStepOfIndex;
                                break;
                            default:
                                // If the dates are not following each other up we just push it to the array
                                handledSteps.push(handledStep);
                                break;
                        }
                    } else {
                        // If we don't find a step with the same group and role for that user we just push it to the array.
                        handledSteps.push(handledStep);
                    }
                }

                sails.log.info('Trying to merge the steps, contract has ' + handledSteps.length + ' unmergeable steps');
            } else {
                sails.log.info('Contract has only one step.');

                // If only one step, handle it
                const handledStep = ImportHelper.handleStep(steps);

                if (handledStep) {
                    handledSteps.push(handledStep);
                }
            }
        }

        let contractEndDate = null;
        const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

        // Get the valid steps
        const handledStepsOfLastFiveYears = ImportHelper.getValidSteps(handledSteps);

        if (!hasPermanentContract) {
            const toDates = handledStepsOfLastFiveYears.filter(
                handledStep => _.has(handledStep, 'to') && moment(handledStep.to).isValid()
            ).map(handledStep => moment(handledStep.to));

            contractEndDate = moment.max(toDates).startOf('day');
        }

        const user = await User.findOne({cid: employee.cid});

        if (!user){
            continue;
        }

        if (contractEndDate !== user.contract_end_date && contractEndDate !== null) {
            if (!moment(user.contract_end_date).isSame(contractEndDate)) {
                sails.log.debug(`We were expecting another contract end date: ${contractEndDate} but we got ${user.contract_end_date}`);
                wrongEndDates.push(user);
            } else {
                sails.log.debug('Same contract end date: ' + moment(contractEndDate).format(ISO8601Format));
            }
        } else {
            sails.log.debug('Same contract end date: ' + contractEndDate);
        }
    }

    sails.log.debug('Wrong end dates: ' + wrongEndDates.length);

    for (const user of wrongEndDates) {
        sails.log.debug(user);
    }
}

/**
 * Search for users in Pentaho that have a valid contract in the past but a not valid current one.
 */
async function specialCase() {
    const ignoredRoles = ImportHelper.getIgnoredRoles();

    const ISO8601Format = ImportHelper.getISO8601Format();

    const reqOptionsEmployees = ImportHelper.getEmployeesRequestOptions();
    let employees = await ImportHelper.getEmployees(reqOptionsEmployees);

    employees = employees.filter(e => ignoredRoles.includes(e.Ruolo_AD));

    sails.log.debug(employees.length);

    // Get all CID codes in one Array
    const cidCodes = employees.map(employee => employee.cid);

    // Get the contractual history of the CID codes
    const contracts = await ImportHelper.getContractualHistoryOfCidCodes(cidCodes);

    for (const contract of contracts) {
        if (contract.contratto_secondario !== 'X') {
            const employee = employees.find(e => e.cid === contract.cid);
            if (_.has(contract, 'step')) {
                if (!_.has(employee, 'contract')) {
                    employee.contract = [contract];
                } else {
                    employee.contract.push(contract);
                }
            }
        }
    }

    // Only keep the employees with a contract
    employees = employees.filter(e => _.has(e, 'contract'));

    // Merge the duplicate employees
    employees = ImportHelper.mergeDuplicateEmployees(employees);

    const specialUsers = [];

    for (const employee of employees) {
        sails.log.info('-----------------------------------------------------------------');

        const contract = _.head(employee.contract);
        const handledSteps = [];

        // Check if the contract has a step and a cid
        if (
            _.has(contract, 'step') &&
            _.has(contract, 'cid')
        ) {
            const steps = contract.step;

            // Check if there are more steps
            if (_.isArray(steps)) {
                sails.log.info('Contract has ' + steps.length + ' steps');

                // Loop over the steps
                for (const step of steps) {

                    // Handle the step
                    const handledStep = ImportHelper.handleStep(step);

                    // Ignore the step if it doesn't have a from, jobTitle or line property
                    if (
                        !_.has(handledStep, 'from') ||
                        !_.has(handledStep, 'jobTitle') ||
                        !_.has(handledStep, 'lines')
                    ) {
                        continue;
                    }

                    let sameHandledStepIndex;

                    // We look if the user has already step with the same group and role
                    if (_.isArray(handledStep.lines)) {
                        sameHandledStepIndex = handledSteps.findIndex(
                            s => s.jobTitle === handledStep.jobTitle &&
                                JSON.stringify(s.lines) === JSON.stringify(handledStep.lines)
                        );
                    }

                    // If that's the case: we check if we can merge it together
                    if (sameHandledStepIndex !== -1) {
                        const handledStepOfIndex = handledSteps[sameHandledStepIndex];

                        // We concatenate the from or to date if they are following each other up.
                        switch (true) {
                            case moment(handledStep.from, ISO8601Format).diff(
                                moment(handledStepOfIndex.to, ISO8601Format), 'days'
                            ) === 1:
                                // When the start date of the new step is one day after the end date of the found step
                                // We check if the found step has an end date.
                                if (handledStep.to) {
                                    // If yes, we override the end date of the new step
                                    handledStepOfIndex.to = handledStep.to;
                                } else {
                                    // If not we delete the end date
                                    delete handledStepOfIndex.to;
                                }
                                // we override the existing step
                                handledSteps[sameHandledStepIndex] = handledStepOfIndex;
                                break;
                            case moment(handledStepOfIndex.from, ISO8601Format).diff(
                                moment(handledStep.to, ISO8601Format), 'days'
                            ) === 1:
                                // When the end date of the new step is one day before the begin date of the found step
                                // We set the start date of the found step to the start date of the new step.
                                handledStepOfIndex.from = handledStep.from;
                                // we override the existing step
                                handledSteps[sameHandledStepIndex] = handledStepOfIndex;
                                break;
                            default:
                                // If the dates are not following each other up we just push it to the array
                                handledSteps.push(handledStep);
                                break;
                        }
                    } else {
                        // If we don't find a step with the same group and role for that user we just push it to the array.
                        handledSteps.push(handledStep);
                    }
                }

                sails.log.info('Trying to merge the steps, contract has ' + handledSteps.length + ' unmergeable steps');
            } else {
                sails.log.info('Contract has only one step.');

                // If only one step, handle it
                const handledStep = ImportHelper.handleStep(steps);

                if (handledStep) {
                    handledSteps.push(handledStep);
                }
            }

            // Get the valid steps
            const handledStepsOfLastFiveYears = ImportHelper.getValidSteps(handledSteps);
            if (!_.isEmpty(handledStepsOfLastFiveYears)) {
                specialUsers.push(employee);
            }
        }
    }
    sails.log.debug(specialUsers.length);
    for (const e of specialUsers) {
        sails.log.debug(e.email);
        sails.log.debug(e.nome + ' ' + e.cognome);
    }
}