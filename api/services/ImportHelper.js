/* global ResearchEntityData */
// ImportHelper.js - in api/services

"use strict";

module.exports = {
    getDefaultEmail,
    getValueHiddenPrivacy,
    getISO8601Format,
    getContractualHistoryOfCidCodes,
    getValidSteps,
    mergeStepsOfContract,
    handleStep,
    getContractEndDate,
    mergeDuplicateEmployees,
    getEmployees,
    getEmployeesRequestOptions,
    getIgnoredRoles,
    createUserObject,
    getProfileObject
};

const moment = require('moment');
moment.locale('en');

const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const zone = moment.tz.guess();
const valuePublicPrivacy = 'public';

const defaultEmail = 'all';
const valueHiddenPrivacy = 'hidden';


function getDefaultEmail() {
    return defaultEmail;
}

function getValueHiddenPrivacy() {
    return valueHiddenPrivacy;
}

function getISO8601Format() {
    return ISO8601Format;
}

/**
 * Get the contractual history for an array of cid codes
 *
 * @param {String[]}    codes   Array of strings.
 *
 * @returns {Object[]}
 */
// This function will return an array of valid contracts
async function getContractualHistoryOfCidCodes(codes) {

    let contracts = [];
    const chunkLength = 250;

    // Endpoint options to get contract history
    const reqOptionsContractHistory = {
        url: sails.config.scientilla.userImport.endpoint,
        params: {
            rep: 'PROD',
            trans: '/public/storico_contrattuale_UO_node',
            output: 'json'
        },
        headers: {
            username: sails.config.scientilla.userImport.username,
            password: sails.config.scientilla.userImport.password
        }
    };

    function handleResponse(response) {

        if (_.has(response, '_.CID') && !_.isEmpty(response._.CID)) {
            response = response._.CID;

            if (_.isArray(response)) {
                for (const contract of response) {
                    if (_.has(contract, '_')) {
                        contracts.push(contract._);
                    }
                }
            } else {
                if (_.has(response, '_')) {
                    contracts.push(response._);
                }
            }
        }
    }

    // We need to split the CID codes into chunks because
    // the Pentaho API endpoint cannot handle a large group of CID codes.
    try {
        if (codes.length > chunkLength) {
            const groups = _.chunk(codes, chunkLength);

            for (const group of groups) {
                reqOptionsContractHistory.params.cid = group.join(',');

                const response = await Utils.waitForSuccesfulRequest(reqOptionsContractHistory);

                handleResponse(response);
            }
        } else {
            reqOptionsContractHistory.params.cid = codes.join(',');

            const response = await Utils.waitForSuccesfulRequest(reqOptionsContractHistory);

            handleResponse(response);
        }

        return contracts;

    } catch (e) {
        sails.log.debug('importUserHistoryContracts:getContractualHistoryOfCIDCodes');
        sails.log.debug(e);
    }
}

/**
 * This function gets the valid steps of a contract:
 * A valid step is the current step (current position of employee) or one from the past until
 * 5 years ago that have a valid job title.
 *
 * @param {Object[]}    steps   Array of Objects.
 *
 * @returns {Object[]}
 */
function getValidSteps(steps) {
    // Get the date of 5 years ago.
    const fiveYearsAgo = moment().subtract('5', 'years').startOf('day');

    const ignoredRoles = getIgnoredRoles();

    // Return an array of filtered steps
    return steps.filter(step => {
        // Only return the step if:
        // it has no to date (so current job)
        // or when it has an to date until 5 years ago
        // and if the job title should not be ignored.
        if (
            (
                !_.has(step, 'to') ||
                _.has(step, 'to') && moment(step.to, ISO8601Format).diff(fiveYearsAgo) > 0
            ) &&
            !ignoredRoles.includes(step.jobTitle)
        ) {
            return step;
        }
    });
}

/**
 * This function tries to merge all the steps of a contract
 * and returns an array of the "unique" steps.
 *
 * @param {Object[]}    contract   Array of Objects.
 *
 * @returns {Object[]}
 */
function mergeStepsOfContract(contract) {

    const handledSteps = [];

    // Check if there are more steps
    if (_.isArray(contract.step)) {
        const steps = _.orderBy(contract.step, function (step) {
            return new moment(step.from, ISO8601Format).format(ISO8601Format);
        }, ['desc']);

        // Loop over the steps
        for (const step of steps) {

            // Handle the step
            const handledStep = handleStep(step);

            // Ignore the step if it doesn't have a from, jobTitle or line property
            if (
                !_.has(handledStep, 'from') ||
                !_.has(handledStep, 'jobTitle') ||
                !_.has(handledStep, 'lines')
            ) {
                continue;
            }

            let sameHandledSteps = [];

            // We look if the user has already step with the same group and role
            if (_.isArray(handledStep.lines)) {
                sameHandledSteps = handledSteps.filter(
                    s => s.jobTitle === handledStep.jobTitle &&
                        JSON.stringify(s.lines) === JSON.stringify(handledStep.lines)
                );
            }

            let mergedStep = false;
            let skipStep = false;

            for (const [index, sameHandledStep] of sameHandledSteps.entries()) {
                if (moment(handledStep.from, ISO8601Format).diff(
                    moment(sameHandledStep.to, ISO8601Format), 'days'
                ) === 1) {
                    // When the start date of the new step is one day after the end date of the found step
                    // We check if the found step has an end date.
                    if (handledStep.to) {
                        // If yes, we override the end date of the new step
                        sameHandledStep.to = handledStep.to;
                    } else {
                        // If not we delete the end date
                        delete sameHandledStep.to;
                    }
                    // we override the existing step
                    handledSteps[index] = sameHandledStep;

                    mergedStep = true;

                    continue;
                }

                if (moment(sameHandledStep.from, ISO8601Format).diff(
                    moment(handledStep.to, ISO8601Format), 'days'
                ) === 1) {
                    // When the end date of the new step is one day before the begin date of the found step
                    // We set the start date of the found step to the start date of the new step.
                    sameHandledStep.from = handledStep.from;
                    // we override the existing step
                    handledSteps[index] = sameHandledStep;

                    mergedStep = true;

                    continue;
                }

                if (
                    moment(sameHandledStep.from, ISO8601Format).diff(
                        moment(handledStep.from, ISO8601Format), 'days'
                    ) <= 0 && !_.has(sameHandledStep, 'to')
                ) {
                    skipStep = true;

                    continue;
                }

                if (
                    moment(sameHandledStep.from, ISO8601Format).diff(
                        moment(handledStep.from, ISO8601Format), 'days'
                    ) <= 0 &&
                    _.has(sameHandledStep, 'to') &&
                    moment(sameHandledStep.to, ISO8601Format).diff(
                        moment(handledStep.to, ISO8601Format), 'days'
                    ) >= 0
                ) {
                    skipStep = true;
                }
            }

            if (!skipStep && !mergedStep) {
                handledSteps.push(handledStep);
            }
        }

    } else {
        // If only one step, handle it
        const handledStep = handleStep(contract.step);

        if (handledStep) {
            handledSteps.push(handledStep);
        }
    }

    return handledSteps;
}

/**
 * This function handles a step of a contract
 *
 * It will return an object with the group code, from (start date), to (end date) and the role of the membership.
 *
 * Or it will return false if it doesn't have the required properties or value.
 *
 * @param {Object}    step   Object.
 *
 * @returns {Object|false}
 */
function handleStep(step) {
    if (
        _.has(step, '_.linea') &&
        _.has(step, '_.stato') &&
        (step._.stato === 'in forza' || step._.stato === 'sospeso')
    ) {
        const handledStep = {
            from: null,
            jobTitle: null,
            lines: []
        };

        if (_.has(step, '_.data_inizio')) {
            // Skip step if it is one of the future
            if (moment(step._.data_inizio, 'DD/MM/YYYY').isAfter(moment())) {
                return;
            }

            handledStep.from = moment.tz(step._.data_inizio, 'DD/MM/YYYY', zone).utc().format(ISO8601Format);
        }

        if (_.has(step, '_.data_fine')) {
            const to = moment(step._.data_fine, 'DD/MM/YYYY');
            if (!moment('31/12/9999', 'DD/MM/YYYY').isSame(to)) {
                handledStep.to = moment.tz(step._.data_fine, 'DD/MM/YYYY', zone).utc().format(ISO8601Format);
            }
        }

        if (_.has(step, '_.ruolo')) {
            handledStep.jobTitle = step._.ruolo;
        }

        const lines = step._.linea;
        if (_.isArray(lines)) {
            let tmpLines = lines.map(line => line._).map(line => {
                const tmpLine = {};
                if (_.has(line, 'codice')) {
                    tmpLine.code = line.codice;
                }

                if (_.has(line, 'nome')) {
                    tmpLine.name = line.nome;
                }

                if (_.has(line, 'ufficio')) {
                    if (_.lowerCase(line.ufficio) === 'iit') {
                        tmpLine.institute = line.ufficio;
                    } else {
                        tmpLine.office = line.ufficio;
                    }
                }

                return tmpLine;
            });
            tmpLines = _.orderBy(tmpLines, 'percentage', 'desc');
            tmpLines.forEach(line => delete line.percentage);

            handledStep.lines = tmpLines;
        } else {
            const line = lines._;
            const newLine = {};
            if (_.has(line, 'codice')) {
                newLine.code = line.codice;
            }

            if (_.has(line, 'nome')) {
                newLine.name = line.nome;
            }

            if (_.has(line, 'ufficio')) {
                if (_.lowerCase(line.ufficio) === 'iit') {
                    newLine.institute = line.ufficio;
                } else {
                    newLine.office = line.ufficio;
                }
            }

            handledStep.lines.push(newLine);
        }

        return handledStep;
    }

    return false;
}

/**
 * This function return the contract end date of a employee as a moment object,
 * if the employee has a permanent contract it will return null
 *
 * @param Boolean       hasPermanentContract
 * @param {Object[]}    handledStepsOfLastFiveYears     Array of Objects.
 *
 * @returns {Object|null}
 */
function getContractEndDate(hasPermanentContract, handledStepsOfLastFiveYears) {
    let contractEndDate = null;

    if (!hasPermanentContract) {
        const toDates = handledStepsOfLastFiveYears.filter(
            handledStep => _.has(handledStep, 'to') && moment(handledStep.to).isValid()
        ).map(handledStep => moment(handledStep.to));

        contractEndDate = moment.max(toDates).startOf('day');
    }

    return contractEndDate;
}

/**
 * This function merges the duplicates employees and returns an array of unique employees with their contract.
 *
 * @param {Object[]}    employees     Array of Objects.
 *
 * @returns {Object[]}
 */
function mergeDuplicateEmployees(employees) {
    const uniqueEmployees = [];

    for (const employee of employees) {
        const uniqueEmployeeIndex = uniqueEmployees.findIndex(e =>
            e.nome === employee.nome &&
            e.cognome === employee.cognome &&
            e.email === employee.email
        );

        if (uniqueEmployeeIndex !== -1) {
            if (!_.has(employee, 'contract') && !_.empty(employee.contract)) {
                if (!_.has(uniqueEmployees[uniqueEmployeeIndex], 'contract')) {
                    uniqueEmployees[uniqueEmployeeIndex].contract = [];
                }

                uniqueEmployees[uniqueEmployeeIndex].contract.push(employee.contract);
            }
        } else {
            uniqueEmployees.push(employee);
        }
    }

    return uniqueEmployees;
}

/**
 * This function calls the API to get the employees depending on the options,
 * it will return an array of employee objects.
 *
 * @param {Object}    Options
 *
 * @returns {Object[]}
 */
async function getEmployees(options) {
    try {
        let response = await Utils.waitForSuccesfulRequest(options);

        if (!_.has(response, '_.scheda') || _.isEmpty(response._.scheda)) {
            return false;
        }

        response = response._.scheda;

        if (_.isArray(response)) {
            return response;
        } else {
            return [response];
        }
    } catch (e) {
        sails.log.debug('ImporterHelper:getEmployees');
        sails.log.debug(e);
    }
}

/**
 * This function returns an object with the API endpoint parameters
 *
 * @returns {Object}
 */
function getEmployeesRequestOptions() {
    return {
        url: sails.config.scientilla.userImport.endpoint,
        params: {
            rep: 'PROD',
            trans: '/public/scheda_persona_flat',
            output: 'json',
            email: defaultEmail
        },
        headers: {
            username: sails.config.scientilla.userImport.username,
            password: sails.config.scientilla.userImport.password
        }
    };
}

/**
 * This function returns an array with roles that have to be ignored.
 *
 * @returns {String[]}
 */
function getIgnoredRoles() {
    return [
        'Altro',
        'Collaboratore',
        'Consultant',
        'Distacco',
        'Fellow',
        'gestione manuale',
        'Guest',
        'Guest Student',
        'Tirocinio Formativo',
        'Work Experience'
    ];
}

/**
 * This function returns an user object created with the passed data.
 *
 * @param {Object[]}        ldapUsers          Array of Objects.
 * @param {Object}          user
 * @param {Object}          employee
 * @param {Object|null}     contractEndDate
 *
 * @returns {Object}
 */
function createUserObject(ldapUsers = [], user = {}, employee = {}, contractEndDate = null) {

    const userObject = {
        cid: employee.cid,
        name: null,
        surname: null,
        jobTitle: null,
        lastsynch: moment().utc().format(),
        active: true,
        synchronized: true,
        contract_end_date: contractEndDate
    };

    if (_.has(employee, 'nome')) {
        userObject.name = employee.nome;
    }

    if (_.has(employee, 'cognome')) {
        userObject.surname = employee.cognome;
    }

    if (_.has(employee, 'Ruolo_AD')) {
        userObject.jobTitle = employee.Ruolo_AD;
    }

    if (contractEndDate !== null) {
        userObject.contract_end_date = contractEndDate.format();
    }

    const foundEmployeeEmail = ldapUsers.find(
        ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(employee.email)
    );
    if (_.isEmpty(foundEmployeeEmail)) {

        let keepCurrentUsername = false;

        if (user && _.has(user, 'username')) {
            const foundEmployeeEmail = ldapUsers.find(
                ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(user.username)
            );
            if (!_.isEmpty(foundEmployeeEmail)) {
                keepCurrentUsername = true;
                sails.log.debug(`The email address we received from Pentaho is not available in the Active Directory, 
                    but the old one does: ${user.username}`);
            }
        }

        if (!keepCurrentUsername) {
            userObject.username = null;
        }
    } else {
        userObject.username = _.toLower(employee.email)
    }

    if (_.has(employee, 'nome_AD') && !_.isEmpty(employee.nome_AD)) {
        userObject.display_name = employee.nome_AD;
    }

    if (_.has(employee, 'cognome_AD') && !_.isEmpty(employee.cognome_AD)) {
        userObject.display_surname = employee.cognome_AD;
    }

    return userObject;
}

/**
 * This function return an user profile object created with the passed data.
 *
 * @param {Object}          researchEntityData
 * @param {Object}          contract
 * @param {Object[]}        allMembershipGroups     Array of Objects.
 * @param {Object[]}        allGroups               Array of Objects.
 *
 * @returns {Object}
 */
function getProfileObject(researchEntityData, contract, allMembershipGroups, allGroups) {
    const profile = ResearchEntityData.setupProfile(researchEntityData);

    profile.hidden = (contract.no_people === 'NO PEOPLE' ? true : false);

    let defaultPrivacy = valuePublicPrivacy;
    if (profile.hidden) {
        defaultPrivacy = valueHiddenPrivacy;
    }

    let name = contract.nome;
    if (!_.isEmpty(contract.nome_AD)) {
        name = contract.nome_AD;
    }

    let surname = contract.cognome;
    if (!_.isEmpty(contract.cognome_AD)) {
        surname = contract.cognome_AD;
    }

    profile.username = {
        privacy: defaultPrivacy,
        value: contract.email
    };
    profile.name = {
        privacy: defaultPrivacy,
        value: name
    };
    profile.surname = {
        privacy: defaultPrivacy,
        value: surname
    };
    profile.phone = {
        privacy: defaultPrivacy,
        value: contract.telefono
    };
    profile.jobTitle = {
        privacy: defaultPrivacy,
        value: contract.Ruolo_AD
    };
    profile.roleCategory = {
        privacy: defaultPrivacy,
        value: contract.Ruolo_1
    };

    const groups = [];
    const lines = [];

    for (let i = 1; i < 7; i++) {
        if (!_.isEmpty(contract['linea_' + i])) {
            const code = contract['linea_' + i];
            const name = contract['nome_linea_' + i];
            const office = contract['UO_' + i] !== name ? contract['UO_' + i] : null;

            lines.push({
                code,
                name,
                office
            });
        }
    }

    const codes = lines.map(line => line.code).filter((value, index, self) => self.indexOf(value) === index);

    for (const code of codes) {
        const group = {
            offices: []
        };
        const codeGroup = allGroups.find(group => group.code === code);

        if (codeGroup) {
            if (codeGroup.type === 'Facility' || 'Research Line') {
                group.type = codeGroup.type;
                group.name = codeGroup.name;
                group.code = codeGroup.code;
                group.privacy = defaultPrivacy;
            }

            // This will return the first parent group.
            const membershipGroup = allMembershipGroups.find(g => g.child_group === codeGroup.id && g.parent_group.active);

            if (_.has(membershipGroup, 'parent_group')) {
                const parentGroup = membershipGroup.parent_group;
                if (parentGroup && parentGroup.type === 'Center') {
                    group.center = {
                        name: parentGroup.name,
                        code: parentGroup.code,
                        privacy: defaultPrivacy
                    };
                } else {
                    sails.log.debug('We are only expecting a center as parent group!');
                }
            }
        } else {
            // If it is not an group, we think it's an administrative contract
            const line = lines.find(line => line.code === code);
            const offices = lines.filter(line => line.code === code).map(line => line.office).filter(o => o);

            if (offices.length === 1 && offices[0] === 'IIT') {
                group.type = 'Institute';
            } else {
                group.type = 'Directorate';
                group.offices = offices
            }

            group.name = line.name;
            group.code = line.code;
            group.privacy = defaultPrivacy;
        }

        groups.push(group);
    }

    profile.groups = groups;

    return profile;
}