/* global ResearchEntityData, Group, Utils */
// ImportHelper.js - in api/services

"use strict";

module.exports = {
    getDefaultEmail,
    getValueHiddenPrivacy,
    getDefaultCompany,
    getContractualHistoryOfCidCodes,
    getValidSteps,
    mergeStepsOfContract,
    getContractEndDate,
    mergeDuplicateEmployees,
    getEmployees,
    getUserImportRequestOptions,
    getIgnoredRoles,
    createUserObject,
    getProfileObject,
    importDirectorates,
    filterEmployees,
    collectGroupCodes
};

const moment = require('moment');
moment.locale('en');

const zone = moment.tz.guess();
const valuePublicPrivacy = 'public';

function getDefaultEmail() {
    return 'all';
}

function getValueHiddenPrivacy() {
    return 'hidden';
}

function getISO8601Format() {
    return 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
}

function getDefaultCompany() {
    return 'Istituto Italiano di Tecnologia';
}

/**
 * This function returns an object with the API endpoint parameters
 *
 * @returns {Object}
 */
function getUserImportRequestOptions(type, extraParams = {}) {
    const options = _.cloneDeep(sails.config.scientilla.userImport);

    const trans = (type === 'history') ? '/public/storico_contrattuale_UO_node' : '/public/scheda_persona_flat';
    options.params = Object.assign({
            rep: 'PROD',
            trans,
            output: 'json'
        },
        options.params,
        extraParams);

    if (type === 'employees' && !options.params.email)
        options.params.email = getDefaultEmail();

    return options;
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

    function handleResponse(response) {
        if (_.has(response, '_.CID') && !_.isEmpty(response._.CID)) {
            const cids = response._.CID;

            if (_.isArray(cids)) {
                for (const contract of cids) {
                    if (_.has(contract, '_.step')) {
                        contracts.push(contract._);
                    }
                }
            } else {
                if (_.has(cids, '_.step')) {
                    contracts.push(cids._);
                }
            }
        }
    }

    // We need to split the CID codes into chunks because
    // the Pentaho API endpoint cannot handle a large group of CID codes.
    try {
        const groups = _.chunk(codes, chunkLength);
        for (const group of groups) {
            const options = getUserImportRequestOptions('history', {cid: group.join(',')});
            const response = await Utils.waitForSuccesfulRequest(options);
            handleResponse(response);
        }
    } catch (e) {
        sails.log.debug('importUserHistoryContracts:getContractualHistoryOfCIDCodes');
        sails.log.debug(e);
    }
    return contracts;
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
                _.has(step, 'to') && moment(step.to, getISO8601Format()).diff(fiveYearsAgo) > 0
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
            return new moment(step.from, getISO8601Format()).format(getISO8601Format());
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

            for (const sameHandledStep of sameHandledSteps) {

                const index = handledSteps.findIndex(s => s.jobTitle === sameHandledStep.jobTitle &&
                    JSON.stringify(s.lines) === JSON.stringify(sameHandledStep.lines));

                if (moment(handledStep.from, getISO8601Format()).diff(
                    moment(sameHandledStep.to, getISO8601Format()), 'days'
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

                if (moment(sameHandledStep.from, getISO8601Format()).diff(
                    moment(handledStep.to, getISO8601Format()), 'days'
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
                    moment(sameHandledStep.from, getISO8601Format()).diff(
                        moment(handledStep.from, getISO8601Format()), 'days'
                    ) <= 0 && !_.has(sameHandledStep, 'to')
                ) {
                    skipStep = true;

                    continue;
                }

                if (
                    moment(sameHandledStep.from, getISO8601Format()).diff(
                        moment(handledStep.from, getISO8601Format()), 'days'
                    ) <= 0 &&
                    _.has(sameHandledStep, 'to') &&
                    moment(sameHandledStep.to, getISO8601Format()).diff(
                        moment(handledStep.to, getISO8601Format()), 'days'
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

            handledStep.from = moment.tz(step._.data_inizio, 'DD/MM/YYYY', zone).utc().format(getISO8601Format());
        }

        if (_.has(step, '_.data_fine')) {
            const to = moment(step._.data_fine, 'DD/MM/YYYY');
            if (!moment('31/12/9999', 'DD/MM/YYYY').isSame(to)) {
                handledStep.to = moment.tz(step._.data_fine, 'DD/MM/YYYY', zone).utc().format(getISO8601Format());
            }
        }

        if (_.has(step, '_.Ruolo_AD')) {
            handledStep.jobTitle = step._.Ruolo_AD;
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
                        tmpLine.code = 'IIT1.01DS';
                        tmpLine.institute = line.ufficio;
                    } else {
                        tmpLine.office = line.ufficio;
                    }
                }

                if (!_.isEmpty(tmpLine)) {
                    return tmpLine;
                }
            }).filter(line => line !== undefined);
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
                    newLine.code = 'IIT1.01DS';
                    newLine.institute = line.ufficio;
                } else {
                    newLine.office = line.ufficio;
                }
            }

            if (!_.isEmpty(newLine)) {
                handledStep.lines.push(newLine);
            }
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
        userObject.displayName = employee.nome_AD;
    }

    if (_.has(employee, 'cognome_AD') && !_.isEmpty(employee.cognome_AD)) {
        userObject.displaySurname = employee.cognome_AD;
    }

    if (!_.has(user, 'config')) {
        userObject.config = {
            scientific: false
        };
    } else {
        userObject.config = user.config;
    }

    if (!_.has(user, 'config.scientific')) {
        userObject.config.scientific = false;
    } else {
        userObject.config.scientific = user.config.scientific;
    }

    return userObject;
}

/**
 * This function return an user profile object created with the passed data.
 *
 * @param {Object}          researchEntityData
 * @param {Object}          contract
 * @param {Object[]}        allMembershipGroups     Array of Objects.
 * @param {Object[]}        activeGroups               Array of Objects.
 *
 * @returns {Object}
 */
function getProfileObject(researchEntityData, contract, allMembershipGroups, activeGroups) {
    const profile = ResearchEntityData.setupProfile(researchEntityData);

    if (!profile) {
        return;
    }

    profile.hidden = (contract.no_people === 'NO PEOPLE' ? true : false);

    let defaultPrivacy = valuePublicPrivacy;
    if (profile.hidden) {
        defaultPrivacy = getValueHiddenPrivacy();
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
    profile.gender = {
        privacy: defaultPrivacy,
        value: contract.genere
    };
    profile.nationality = {
        privacy: getValueHiddenPrivacy(),
        value: contract.nazionalita
    };
    profile.dateOfBirth = {
        privacy: getValueHiddenPrivacy(),
        value: moment(contract.data_nascita, 'YYYYMMDD').format('YYYY-MM-DD')
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

        const codeGroup = activeGroups.find(group => group.code === code);
        let skipCenter = false;
        const group = {};

        if (codeGroup) {

            group.type = codeGroup.type;
            group.name = codeGroup.name;
            group.code = codeGroup.code;
            group.privacy = defaultPrivacy;

            const line = lines.find(line => line.code === code);
            const offices = lines.filter(line => line.code === code).map(line => line.office).filter(o => o);

            if (offices.length === 1 && offices[0] === 'IIT') {
                group.type = 'Institute';
                group.name = 'Istituto Italiano di Tecnologia';
                group.code = 'IIT';
                skipCenter = true;
            } else {
                group.type = codeGroup.type;
                group.offices = offices;
                group.name = line.name;
                group.code = line.code;
            }

            if (!skipCenter) {
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
                        sails.log.info('We are only expecting a center as parent group!');
                    }
                }
            }
        } else {
            group.type = 'Institute';
            group.name = 'Istituto Italiano di Tecnologia';
            group.code = 'IIT';
        }

        groups.push(group);
    }

    profile.groups = groups;

    return profile;
}

/**
 * This function return an user profile object created with the passed data.
 *
 * @param {Object[]}        employees            Array of Objects.
 * @param {Object[]}        groups               Array of Objects.
 */
async function importDirectorates(employees, groups) {
    const directorates = [];
    const updatedDirectorates = [];
    const createdDirectorates = [];

    for (const employee of employees) {
        for (let i = 1; i < 7; i++) {
            if (!_.isEmpty(employee['linea_' + i])) {
                const code = employee['linea_' + i];
                const name = employee['nome_linea_' + i];
                const office = employee['UO_' + i];

                const directorate = directorates.find(d => d.code === code);
                const group = groups.find(g => g.code === code && g.type !== 'Directorate');

                if (!directorate && !group) {
                    directorates.push({
                        code: code,
                        name: name,
                        office: office
                    });
                }
            }
        }
    }

    for (const directorate of directorates) {
        const group = await Group.findOne({
            code: directorate.code,
            type: 'Directorate'
        });

        const groupData = {
            code: directorate.code,
            name: directorate.name,
            type: 'Directorate',
            description: null,
            //description: directorate.office, // Cannot because some codes have more offices like ROO001
            slug: directorate.name.toLowerCase().trim().replace(/\./gi, '-').split('@')[0]
        };

        if (group) {
            await Group.update({id: group.id}, groupData);
            updatedDirectorates.push(group);
        } else {
            groupData.active = false;
            await Group.create(groupData);
            createdDirectorates.push(groupData);
        }
    }

    sails.log.info(`Created ${createdDirectorates.length} & updated ${updatedDirectorates.length} directorates.
        Please add them to their parent group and check their active state!`);
}

/**
 * This function returns an  array of filtered employees. It filters out:
 * - the secondary contracts
 * - the contracts with an ignored role
 * - the contracts with the property desc_sottoarea !== 'Gov. & Control' except if the property e.linea_1 === 'PRS001'
 *
 * @param {Object[]}        employees               Array of Objects.
 *
 * @returns {Object[]}
 */
function filterEmployees(employees) {
    const ignoredRoles = getIgnoredRoles();

    return employees.filter(e => _.has(e, 'desc_sottoarea') &&
        _.has(e, 'linea_1') &&
        (
            e.desc_sottoarea !== 'Gov. & Control' ||
            e.desc_sottoarea === 'Gov. & Control' && e.linea_1 === 'PRS001'
        ) &&
        e.contratto_secondario !== 'X' &&
        !ignoredRoles.includes(e.Ruolo_AD)
    );
}

/**
 * This function returns an array of codes
 *
 * @param {Object}        contract               Contract object.
 *
 * @returns {String[]}
 */
function collectGroupCodes(contract) {
    const codes = [];
    for (let i = 1; i <= 6; i++) {
        if (!_.isEmpty(contract['linea_' + i]) && !_.isEmpty(contract['UO_' + i])) {
            if (contract['UO_' + i] === 'IIT') {
                codes.push('IIT1.01DS');
            } else {
                codes.push(contract['linea_' + i]);
            }

        }
    }
    return codes;
}