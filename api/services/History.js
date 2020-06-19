/* global ResearchEntityData, User, Membership, Group, MembershipGroup, Utils, ImportHelper, Analyser */

"use strict";

module.exports = {
    removeData,
    importContracts,
};

const moment = require('moment');
moment.locale('en');

// Get the contract history of the users
async function removeData() {
    // Delete all users without any documents and accomplishments
    const userIds = await Analyser.searchForUsersWithoutDocumentsAndAccomplishments();
    await User.destroy({id: userIds});
    sails.log.info(`Deleted ${userIds.length} (with role='user') users without documents and accomplishments`);

    // Delete all memberships where synchromized = true
    await Membership.destroy({synchronized: true});
}

async function importContracts(email = ImportHelper.getDefaultEmail()) {

    // Private helper functions

    // Function to check the membership by code, end date and user
    async function checkMembership(code, to, user) {
        // Find the group by the code
        const group = allGroups.find(g => g.code === code);

        // Check if the group code exists in the group table, otherwise it is an very old group
        if (group) {

            // Check if the user already has a membership of the group
            const membershipOfGroup = await Membership.findOne({user: user.id, group: group.id});
            let active = false;

            // Set the active state to true if the to date is in the future or if permanent contract
            if (_.isNil(to) || moment(to, ISO8601Format).diff(moment().startOf('day')) >= 0) {
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

    async function handleEmployeeHistory(employee) {

        if (!_.has(employee, 'contract')) {
            return;
        }

        if (employee.contract.length > 1) {
            sails.log.info(employee.email + ' has ' + employee.contract.length + ' contracts!');
        }

        const contract = _.head(employee.contract);
        let handledSteps = [];

        // Check if the contract has a step and a cid
        if (
            _.has(contract, 'step') &&
            _.has(contract, 'cid')
        ) {
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

            handledSteps = ImportHelper.mergeStepsOfContract(contract);

            // Get the valid steps
            const handledStepsOfLastFiveYears = ImportHelper.getValidSteps(handledSteps);

            if (handledStepsOfLastFiveYears.length === 0) {
                sails.log.info('This user doesn\'t have a current contract or a contract with a valid role in the last 5 years!');
                if (employee) {
                    toBeDeletedEmployees.push(employee);
                }

                // We go to the next user
                return;
            }

            // Get the expire date of a user from its memberships
            // The expire date will be null for a permanent contract or the youngest end date of a contract.
            const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

            const contractEndDate = ImportHelper.getContractEndDate(hasPermanentContract, handledStepsOfLastFiveYears);

            // Set the active state of the user account:
            // It's active when the user has a permanent contract or
            // when the current date if before the expire date of the contract.
            let active = false;
            if (hasPermanentContract || (contractEndDate && moment().isBefore(contractEndDate))) {
                active = true;
            }

            const userObject = ImportHelper.createUserObject(ldapUsers, user, employee, contractEndDate);

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
                        const profile = ImportHelper.getProfileObject({}, employee, allMembershipGroups, allGroups);

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
                    const profile = ImportHelper.getProfileObject({}, employee, allMembershipGroups, allGroups);
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

    const ISO8601Format = ImportHelper.getISO8601Format();
    const defaultCompany = 'Istituto Italiano di Tecnologia';
    const valueHiddenPrivacy = ImportHelper.getValueHiddenPrivacy();

    // We cache the groups, membership groups and default profile.
    const allGroups = await Group.find({active: true});
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const ldapUsers = await Utils.getActiveDirectoryUsers();

    // Endpoint options to get all users
    const reqOptionsEmployees = ImportHelper.getEmployeesRequestOptions();

    const createdUsers = [];
    let toBeDeletedEmployees = [];
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
    let employees = await ImportHelper.getEmployees(reqOptionsEmployees);

    if (employees) {
        employees = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea !== 'Gov. & Control');

        // Store the other user to delete them later
        toBeDeletedEmployees = employees.filter(e => _.has(e, 'desc_sottoarea') && e.desc_sottoarea === 'Gov. & Control');

        // Get all CID codes in one Array
        const cidCodes = employees.map(employee => employee.cid);
        sails.log.info('Found ' + cidCodes.length + ' CID codes!');

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
            } else {
                if (contracts.length === 1) {
                    const employee = employees.find(e => e.cid === contract.cid);
                    if (employee) {
                        toBeDeletedEmployees.push(employee);
                    }
                }
            }
        }

        // Only keep the employees with a contract
        employees = employees.filter(e => _.has(e, 'contract'));

        // Merge the duplicate employees
        employees = ImportHelper.mergeDuplicateEmployees(employees);

        for (const employee of employees) {
            sails.log.info('-----------------------------------------------------------------');
            await handleEmployeeHistory(employee);
        }
    }

    let i = toBeDeletedEmployees.length;
    while (i--) {
        const employee = toBeDeletedEmployees[i];
        const user = await User.findOne({cid: employee.cid});
        if (user) {
            sails.log.info('Deleted user:' + JSON.stringify(user));
            await User.destroy({id: user.id});
        } else {
            toBeDeletedEmployees.splice(i, 1);
        }
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
    sails.log.info('Number of deleted users: ' + toBeDeletedEmployees.length);

    sails.log.info('-----------------------------------------------------------------');
    const stoppedTime = moment.utc();
    sails.log.info('The import stopped at ' + stoppedTime.format());
    sails.log.info('The duration of the import was done ' + moment.duration(stoppedTime.diff(startedTime)).humanize(true));
}