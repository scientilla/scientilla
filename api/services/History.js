/* global ResearchEntityData, User, Membership, Group, MembershipGroup, Utils, Importer, Analyser */

"use strict";

const moment = require('moment');
moment.locale('en');

module.exports = {
    removeData,
    importContracts
};

const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const zone = moment.tz.guess();
const defaultCompany = 'Istituto Italiano di Tecnologia';
const defaultEmail = 'all';
const valueHiddenPrivacy = 'hidden';

// Get the contract history of the users
async function removeData() {
    // Delete all users without any documents and accomplishments
    const userIdsWithoutDocumentsAndAccomplishments = await Analyser.searchForUsersWithoutDocumentsAndAccomplishments();
    await User.destroy({id: userIdsWithoutDocumentsAndAccomplishments});

    // Delete all memberships where synchromized = true
    await Membership.destroy({synchronized: true});
}

async function importContracts(email = defaultEmail) {

    // Helper functions

    // This function will return an array of valid contracts
    async function getContractualHistoryOfCIDCodes(codes) {
        // We need to split the CID codes into chunks because the Pentaho API endpoint cannot handle a large group of
        // CID codes.
        let contracts = [];
        const chunkLength = 250;

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

        try {
            if (codes.length > chunkLength) {
                const groups = _.chunk(codes, chunkLength);

                sails.log.info('Splitting the CID codes into groups of ' + chunkLength);

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

    // Function to check the membership by code, endate and user
    async function checkMembership(code, to, user) {
        // Find the group by the code
        const group = allGroups.find(g => g.code === code);

        // Check if the group code exists in the group table, otherwise it is an very old group
        if (group) {

            // Check if the user already has a membership of the group
            const membershipOfGroup = await Membership.findOne({user: user.id, group: group.id});
            let active = false;

            // Set the active state to true if the to date is in the future
            if (moment(to, ISO8601Format).diff(moment().startOf('day')) >= 0) {
                active = true;
            }

            // We update the current membership
            if (membershipOfGroup) {
                const updatedMembership = await Membership.update(
                    {id: membershipOfGroup.id},
                    {
                        lastsynch: moment().utc().format(),
                        active: active,
                        synchronized: true
                    }
                );
                sails.log.info('We update the membership with the following parameters: email address: ' +
                    user.username + ', group ' + group.code + ' & active state: ' + active);
                updatedMemberships.push(updatedMembership);
            } else {
                // Or we create a new one
                const newMembership = await Membership.create({
                    user: user.id,
                    group: group.id,
                    lastsynch: moment().utc().format(),
                    active: active,
                    synchronized: true
                });
                sails.log.info('We create a membership with the following parameters: email address: ' +
                    user.username + ', group: ' + group.code + ' & active state: ' + active);
                createdMemberships.push(newMembership);
            }
        } else {
            sails.log.info('The group with code: ' + code + ' is not active or doesn\'t exist');
        }

        return;
    }

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
     * Get the valid steps of a contract:
     * These are the current steps and the ones until 5 years ago that have a valid job title.
     *
     * @param {Object[]}    steps   Array of Objects.
     *
     * @returns {Object[]}
     */
    function getValidSteps(steps) {
        // Get the date of 5 years ago.
        const fiveYearsAgo = moment().subtract('5', 'years').startOf('day');

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

    async function handleEmployeeHistory(employee) {

        // This function will return false or an object with the groupCode, from (start date), to (end date),
        // role of the membership
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
                            tmpLine.office = line.ufficio;
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
                        newLine.office = line.ufficio;
                    }

                    handledStep.lines.push(newLine);
                }

                return handledStep;
            }

            return false;
        }

        if (!_.has(employee, 'contract')) {
            return;
        }

        if (employee.contract.length > 1) {
            sails.log.info(employee.email + ' has ' + employee.contract.length + ' contracts!');
        }

        const contract = _.head(employee.contract);
        const handledSteps = [];

        // Check if the contract has a step and a cid
        if (
            _.has(contract, 'step') &&
            _.has(contract, 'cid')
        ) {
            const steps = contract.step;

            // First try to get the user by the CID code
            let user = await User.findOne({cid: contract.cid});

            // If the user is not found with the CID code, try with the email
            if (!user && !_.isEmpty(employee.email)) {
                user = await User.findOne({username: employee.email});
            }

            // If the user is not found with the email, try with name and surname
            if (!user) {
                user = await User.findOne({
                    name: employee.nome,
                    surname: employee.cognome
                });
            }

            // Check if there are more steps
            if (_.isArray(steps)) {
                sails.log.info('Contract has ' + steps.length + ' steps');

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
                const handledStep = handleStep(steps);

                if (handledStep) {
                    handledSteps.push(handledStep);
                }
            }

            // Get the valid steps
            const handledStepsOfLastFiveYears = getValidSteps(handledSteps);

            if (handledStepsOfLastFiveYears.length === 0) {
                sails.log.info('This user doesn\'t have a current contract or a contract with a valid role in the last 5 years!');
                if (user) {
                    toBeDeletedUsers.push(user);
                }

                return;
            }

            // Get the expire date of a user from its memberships
            // The expire date will be null for a permanent contract or the youngest end date of a contract.
            let contractEndDate = null;
            const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

            if (!hasPermanentContract) {
                const toDates = handledSteps.filter(handledStep => _.has(handledStep, 'to') && moment(handledStep.to).isValid())
                    .map(handledStep => moment(handledStep.to));

                contractEndDate = moment.max(toDates).startOf('day');

                sails.log.info('This user has a contract that will end on ' + contractEndDate.format());
            } else {
                sails.log.info('This user seems to have a permanent contract!');
            }

            // Set the active state of the user account:
            // It's active when the user has a permanent contract or
            // when the current date if before the expire date of the contract.
            let active = false;
            if (hasPermanentContract || (contractEndDate && moment().isBefore(contractEndDate))) {
                active = true;
            }

            const userObject = Importer.createUserObject(ldapUsers, user, employee);

            userObject.active = active;

            let createAliases = false;

            // When the user does not exist
            if (!user) {

                // We should create a user when the expire date is null
                // or when the expire date is less than five years ago.
                if (
                    contractEndDate === null ||
                    (
                        contractEndDate !== null &&
                        contractEndDate.isSameOrAfter(moment().subtract('5', 'years').startOf('day'))
                    )
                ) {
                    if (contractEndDate !== null) {
                        userObject.contract_end_date = contractEndDate.format();
                    }

                    user = await User.createUserWithoutAuth(userObject);
                    user = await User.findOne({id: user.id});
                    sails.log.info('New user created with data: ' + JSON.stringify(userObject));

                    createdUsers.push(user);
                } else {
                    sails.log.info('User stopped working in IIT more than 5 years ago, so it can be skipped!');
                    skippedUsers++;
                    return;
                }
            } else {
                // If the user already exist
                // And the user has a permanent contract
                if (_.isNull(contractEndDate)) {
                    // But is not been set into the database, we update the user.
                    if (!_.isNull(user.contract_end_date)) {
                        userObject.contract_end_date = null;
                        sails.log.info('The contract end date of the user is been removed.');
                        updatedContractEndDate.push(user);
                    }
                } else {
                    // When the user doesn't have a permanent contract
                    // And the user doesn't have the same expiresAre value we update it.
                    if (_.isNull(user.contract_end_date) || !moment(user.contract_end_date).isSame(contractEndDate)) {
                        userObject.contract_end_date = contractEndDate.format();
                        sails.log.info('The contract end date is been updated to ' + contractEndDate.format());
                        updatedContractEndDate.push(user);
                    }
                }

                if (active !== user.active) {
                    sails.log.info('The active state is been updated to: ' + active);
                    updatedActiveUsers.push(user);
                }

                if (user.display_name !== employee.nome_AD || user.display_surname !== employee.cognome_AD) {
                    createAliases = true;

                    sails.log.info('The display names are been updated to: ' + employee.nome_AD + ' ' + employee.cognome_AD);
                    updatedDisplayNames.push(user);
                }

                await User.update(
                    {id: user.id},
                    userObject
                );
                user = await User.findOne({id: user.id});

                if (createAliases) {
                    await User.createAliases(user);
                }
            }

            // If the we have an user object we go further to create or update the memberships and  profile.
            if (user) {

                // Loop over contract steps and change the active value (former or active member) of the membership
                for (const handledStep of handledSteps) {

                    if (handledStep.lines.length > 1) {
                        sails.log.info('The step is been splitted into ' + handledStep.lines.length + ' lines.');
                    }

                    // We loop over the lines
                    for (const line of handledStep.lines) {
                        // We check the current step
                        await checkMembership(line.code, handledStep.to, user)
                    }
                }

                // We update the user's profile
                let researchEntityData = await ResearchEntityData.findOne({
                    researchEntity: user.researchEntity
                });

                // We add some default values for the profile.
                for (const [key, handledStep] of Object.entries(handledSteps)) {
                    handledStep.privacy = valueHiddenPrivacy;
                    handledStep.company = defaultCompany;
                    handledSteps[key] = handledStep;
                }

                // If we have a researchEntityData record of the user
                if (researchEntityData) {

                    // But the user has no profile
                    if (_.has(researchEntityData, 'profile') && _.isEmpty(researchEntityData.profile)) {
                        // Setup the new profile
                        const profile = Importer.getProfileObject({}, employee, allMembershipGroups, allGroups);

                        profile.experiencesInternal = handledSteps;

                        researchEntityData = await ResearchEntityData.update(
                            {id: researchEntityData.id},
                            {profile: JSON.stringify(profile)}
                        );
                        sails.log.info('We created a profile for the user with the internal experiences.');
                        updatedResearchEntityDataItems.push(researchEntityData);
                    } else {
                        // If the user has a profile, we check if the experiences are equal. If not we update them.
                        if (JSON.stringify(researchEntityData.profile.experiencesInternal) !== JSON.stringify(handledSteps)) {
                            researchEntityData.profile.experiencesInternal = handledSteps;

                            researchEntityData = await ResearchEntityData.update(
                                {id: researchEntityData.id},
                                {profile: JSON.stringify(researchEntityData.profile)}
                            );
                            sails.log.info('The internal experiences are been updated!');
                            updatedResearchEntityDataItems.push(researchEntityData);
                        } else {
                            sails.log.info('The internal experiences are already up-to-date!');
                        }
                    }
                } else {
                    // Setup the new profile
                    const profile = Importer.getProfileObject({}, employee, allMembershipGroups, allGroups);
                    const importedData = _.cloneDeep(employee);
                    delete importedData.contract;

                    profile.experiencesInternal = handledSteps;

                    researchEntityData = await ResearchEntityData.create({
                        research_entity: user.researchEntity,
                        profile: JSON.stringify(profile),
                        imported_data: JSON.stringify(importedData)
                    });
                    sails.log.info('The user didn\'t have a profile yet, so it\'s been created.');
                    createdResearchEntityDataItems.push(researchEntityData);
                }
            }
        }
    }

    const startedTime = moment.utc();
    sails.log.info('The import started at ' + startedTime.format());
    sails.log.info('-----------------------------------------------------------------');

    // We cache the groups, membership groups and default profile.
    const allGroups = await Group.find({active: true});
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const ldapUsers = await Utils.getActiveDirectoryUsers();

    // Endpoint options to get all users
    const reqOptionsEmployees = Importer.getEmployeesRequestOptions();

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

    const ignoredRoles = Importer.getIgnoredRoles();

    const createdUsers = [];
    let toBeDeletedUsers = [];
    const updatedContractEndDate = [];
    const updatedActiveUsers = [];
    const updatedDisplayNames = [];
    const updatedMemberships = [];
    const createdMemberships = [];
    const updatedResearchEntityDataItems = [];
    const createdResearchEntityDataItems = [];

    let skippedUsers = 0;

    reqOptionsEmployees.params.email = email;

    // Get all the employees from Pentaho, including the former employees.
    reqOptionsEmployees.params.statodip = 'tutti';
    let employees = await Importer.getEmployees(reqOptionsEmployees);
    employees = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea !== 'Gov. & Control');

    // Store the other user to delete them later
    toBeDeletedUsers = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea === 'Gov. & Control');

    // Get all CID codes in one Array
    const cidCodes = employees.map(employee => employee.cid);
    sails.log.info('Found ' + cidCodes.length + ' CID codes!');

    // Get the contractual history of the CID codes
    const contracts = await getContractualHistoryOfCIDCodes(cidCodes);

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
        } else {
            if (contracts.length === 1) {
                toBeDeletedUsers.push(contract);
            }
        }
    }

    // Only keep the employees with a contract
    employees = employees.filter(e => _.has(e, 'contract'));

    // Merge the duplicate employees
    employees = mergeDuplicateEmployees(employees);

    for (const employee of employees) {
        sails.log.info('-----------------------------------------------------------------');
        await handleEmployeeHistory(employee);
    }

    for (const user of toBeDeletedUsers) {
        await User.destroy({id: user.id});
    }

    sails.log.info('-----------------------------------------------------------------');

    sails.log.info('Number of created users: ' + createdUsers.length);
    sails.log.info('Number of users that are not been created because of the expireAt date: ' + skippedUsers);
    sails.log.info('Updated the contract end date for ' + updatedContractEndDate.length + ' users');
    sails.log.info('Updated the active state for ' + updatedActiveUsers.length + ' users');
    sails.log.info('Updated the display names for ' + updatedDisplayNames.length + ' users');
    sails.log.info('Number of created memberships: ' + createdMemberships.length);
    sails.log.info('Number of updated memberships: ' + updatedMemberships.length);
    sails.log.info('Number of created researchEntityData items: ' + createdResearchEntityDataItems.length);
    sails.log.info('Number of updated researchEntityData items: ' + updatedResearchEntityDataItems.length);
    sails.log.info('Number of deleted users: ' + toBeDeletedUsers.length);

    sails.log.info('-----------------------------------------------------------------');
    const stoppedTime = moment.utc();
    sails.log.info('The import stopped at ' + stoppedTime.format());
    sails.log.info('The duration of the import was done ' + moment.duration(stoppedTime.diff(startedTime)).humanize(true));
}