"use strict";

module.exports = {
    importUsers,
    removeExpiredUsers,
    analyseUserImport,
    updateUserProfileGroups,
    getUserImportRequestOptions,
};

const moment = require('moment');
moment.locale('en');

const zone = moment.tz.guess();
const valuePublicPrivacy = 'public';

async function importUsers(email = getDefaultEmail()) {

    const startedTime = moment().utc();

    const disabledMemberships = [];
    const enabledMemberships = [];
    const deactivatedUsers = [];
    const activatedUsers = [];
    const createdUsers = [];
    const updatedUsers = [];
    const upToDateUsers = [];
    const updatedResearchEntityDataItems = [];
    const newResearchEntityDataItems = [];
    const upToDateResearchEntityDataItems = [];

    sails.log.info('The import started at ' + startedTime.format());
    sails.log.info('-----------------------------------------------------------------');

    try {
        // Endpoint options to get all users
        const options = getUserImportRequestOptions('employees', {email});

        // Get all the employees from Pentaho.
        let employees = await getEmployees(options);

        if (email !== getDefaultEmail()) {
            employees = employees.filter(e => e.email === email);
        }

        // Override the CID of specified employees
        employees = await overrideCIDAssociations(employees, email);

        // Filter out employees with a invalid email, a secondary contract or ignored role
        employees = filterEmployees(employees);

        // Filter out invalid email addresses, use the cid as temporary email address
        let showLine = false;
        employees = employees.filter(employee => {
            if (
                _.has(employee, 'email') &&
                !_.isNull(employee.email) &&
                !_.isEmpty(employee.email) &&
                employee.email.endsWith('@iit.it')
            ) {
                return employee;
            } else {
                if (
                    _.has(employee, 'stato_dip') &&
                    employee.stato_dip !== 'cessato'
                ) {
                    sails.log.info(`Missing email for employee ${employee.nome} ${employee.cognome}`);
                    showLine = true;
                } else {
                    if (
                        _.has(employee, 'Ruolo_AD') &&
                        employee.Ruolo_AD !== 'Guest Student'
                    ) {
                        employee.email = `${employee.cid}@iit.it`;
                        return employee;
                    }
                }
            }
        });

        if (showLine) {
            sails.log.info('....................................');
        }

        // Check if there are multiple active employees with the same email address (excluding empty email addresses) in the employees array
        getMissingCIDAssociations(employees);

        // We cache the groups, membership groups and default profile.
        const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
        const ldapUsers = await Utils.getActiveDirectoryUsers();
        const groups = await Group.find();
        if (groups.length <= 0) {
            sails.log.info('No groups found...');
        }

        const activeGroups = groups.filter(g => g.active === true);

        // Get all CID codes in one Array
        const cidCodes = employees.map(employee => employee.cid);
        sails.log.info('Found ' + cidCodes.length + ' CID codes!');
        sails.log.info('....................................');

        // Get the contractual history of the CID codes
        const historyContracts = await getContractualHistoryOfCidCodes(cidCodes);

        if (historyContracts.length === 0) {
            return;
        }

        // Add the contract to the employees
        for (const contract of historyContracts) {
            if (contract.contratto_secondario !== 'X') {
                const employee = employees.find(e => e.cid === contract.cid);
                if (employee) {
                    if (_.has(contract, 'step')) {
                        if (!_.has(employee, 'contract')) {
                            employee.contract = [contract];
                        } else {
                            employee.contract.push(contract);
                        }
                    } else {
                        sails.log.debug(`Contract doesn't have any steps: ${employee.email} ${employee.cid} `);
                    }
                }
            }
        }

        // Only keep the employees with a contract
        employees = employees.filter(e => _.has(e, 'contract'));

        // Merge the duplicate employees
        employees = mergeDuplicateEmployees(employees);

        sails.log.info('Looping over employees...');

        for (const employee of employees) {

            // Take first contract
            const contract = _.head(employee.contract);

            // Skip employee if the contract has no step or cid
            if (!_.has(contract, 'step') || !_.has(contract, 'cid')) {
                continue;
            }

            let handledSteps = mergeStepsOfContract(contract);
            const handledStepsOfLastFiveYears = getValidSteps(handledSteps);

            if (handledStepsOfLastFiveYears.length === 0) {
                // Skip employee: does not have a contract last 5 years
                continue;
            }

            let user = await User.findOne({cid: employee.cid});
            if (!user) {
                user = await User.findOne({username: employee.email});
                if (!user) {
                    // Skip employee if it's a former Guest Student
                    if (isFormerGuestStudent(employee)) {
                        continue;
                    }
                }
            }

            const userObject = createUserObject(ldapUsers, user, employee);

            if (!user) {
                await User.createUserWithoutAuth(userObject);
                // Search user again to populate ResearchEntity after creation
                user = await User.findOne({cid: employee.cid});

                if (user.email === `${employee.cid}@iit.it`) {
                    user.email = `${user.id}@iit.it`;
                    await User.update({id: user.id}, user);
                    user = await User.findOne({id: user.id});
                }

                createdUsers.push(user);
            } else {
                // Update user with current data
                if (!isUserEqualWithUserObject(user, userObject)) {
                    await User.update({id: user.id}, userObject);
                    user = await User.findOne({id: user.id});
                    updatedUsers.push(user);
                } else {
                    // User is already up-to-date, only set the lastsynch
                    await User.update({id: user.id}, {lastsynch: moment().utc().format()});
                    user = await User.findOne({id: user.id});
                    upToDateUsers.push(user);
                }

                if (
                    user.displayName !== employee.nome_AD ||
                    user.displaySurname !== employee.cognome_AD
                ) {
                    await User.createAliases(user);
                    sails.log.info(`Create aliases for ${user.username}`);
                }
            }

            if (!user) {
                sails.log.error('No user!');
                continue;
            }

            if (!user.id) {
                sails.log.info(user);
            }

            if (_.has(employee, 'stato_dip') && employee.stato_dip !== 'cessato') {
                const groupCodesOfContract = collectGroupCodes(employee);

                // Get the groups of the contract
                const groupsOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                    return _.toLower(groupCode) === _.toLower(group.code)
                }));

                for (let group of groupsOfContract) {
                    const condition = {
                        user: user.id,
                        group: group.id
                    };
                    let membership = await Membership.findOne(condition);

                    if (!membership) {
                        membership = await Group.addMember(group, user);
                    }

                    await Membership.update(condition, {
                        lastsynch: moment().utc().format(),
                        synchronized: true,
                        active: true
                    });
                    const updatedMembership = await Membership.findOne(condition);

                    if (!membership.active) {
                        enabledMemberships.push(updatedMembership);
                    }
                }

                // Disable all the memberships of the user and the groups where the user doesn't have a contract of
                const groupsOfContractIds = groupsOfContract.map(group => group.id);
                const activeMembershipsOfUser = await Membership.find({
                    user: user.id,
                    active: true
                });

                const disabledMembershipsOfUser = activeMembershipsOfUser.filter(m => !groupsOfContractIds.includes(m.group));
                for (let membership of disabledMembershipsOfUser) {
                    await Membership.update({
                        id: membership.id,
                    }, {
                        lastsynch: moment().utc().format(),
                        active: false
                    });
                    const disabledMembership = await Membership.findOne({id: membership.id});
                    disabledMemberships.push(disabledMembership);
                }

                // Activate user
                if (!user.active) {
                    await User.update({id: user.id}, {active: true});
                    user = await User.findOne({id: user.id});
                    activatedUsers.push(user);
                }
            } else {
                // Disable all memberships for not active users
                const disabledMembershipsOfUser = await Membership.update({
                    user: user.id,
                    active: true
                }, {
                    lastsynch: moment().utc().format(),
                    active: false
                });

                for (let membership of disabledMembershipsOfUser) {
                    disabledMemberships.push(membership);
                }

                // Deactivate user
                if (user.active) {
                    await User.update({id: user.id}, {active: false});
                    user = await User.findOne({id: user.id});
                    deactivatedUsers.push(user);
                }
            }

            let researchEntityData = await ResearchEntityData.findOne({
                researchEntity: user.researchEntity
            });

            // We add some default values for the profile.
            for (const [key, handledStep] of Object.entries(handledSteps)) {
                handledStep.privacy = getValueHiddenPrivacy();
                handledStep.company = getDefaultCompany();
                handledSteps[key] = handledStep;
            }
            const importedData = _.cloneDeep(employee);
            delete importedData.contract;

            // Create or update researchEntityData record
            if (researchEntityData) {
                let profile = getProfileObject(_.cloneDeep(researchEntityData), employee, allMembershipGroups, activeGroups);

                if (!profile) {
                    sails.log.error('No profile!');
                    continue;
                }

                profile.experiencesInternal = _.orderBy(
                    handledSteps,
                    [
                        experience => new moment(experience.from, getISO8601Format()),
                        experience => new moment(experience.to, getISO8601Format())
                    ],
                    [
                        'desc',
                        'desc'
                    ]
                );

                let profileJSONString = JSON.stringify(profile);

                if (profile.hidden) {
                    // Replace all the current public privacy settings to hidden
                    profileJSONString = profileJSONString.replace(/"privacy":"public"/gm, '"privacy":"' + getValueHiddenPrivacy() + '"');
                    profile = JSON.parse(profileJSONString);
                }

                if (!_.isEqual(researchEntityData.profile, profile)) {
                    await ResearchEntityData.update(
                        {id: researchEntityData.id},
                        {
                            profile: profile,
                            importedData: employee
                        }
                    );
                    researchEntityData = await ResearchEntityData.findOne({id: researchEntityData.id});
                    updatedResearchEntityDataItems.push(researchEntityData);
                } else {
                    upToDateResearchEntityDataItems.push(researchEntityData);
                }
            } else {
                const profile = getProfileObject({importedData: importedData}, employee, allMembershipGroups, activeGroups);

                if (!profile) {
                    sails.log.error('No profile!');
                    continue;
                }

                profile.experiencesInternal = handledSteps;

                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
                    profile: JSON.stringify(profile),
                    importedData: JSON.stringify(employee)
                });
                newResearchEntityDataItems.push(researchEntityData);
            }
        }

        sails.log.info('....................................');

        // Check if a user is active but we expected not active
        if (email === getDefaultEmail()) {
            const notExpectedActiveUsers = await User.find({
                lastsynch: { '<': startedTime.format() },
                synchronized: true,
                active: true
            });
            if (notExpectedActiveUsers.length > 0) {
                sails.log.info(`Found ${notExpectedActiveUsers.length} users that are active but expected not to be active, please check manually:`);
            }
            for (const user of notExpectedActiveUsers) {
                sails.log.info(`Email: ${user.username}, name: ${user.name}, surname: ${user.surname}`);
            }
            if (notExpectedActiveUsers.length > 0) {
                sails.log.info('....................................');
            }
        }

        // Check if a user has a contract end date greater than now + 1 year.
        const notActiveUsersWrongContractEndDate = await User.find({
            active: false,
            contractEndDate: { '>': moment().utc().format() },
        });
        if (notActiveUsersWrongContractEndDate.length > 0) {
            sails.log.info(`Found ${notActiveUsersWrongContractEndDate.length} users that has to be checked manually`);
        }
        for (const user of notActiveUsersWrongContractEndDate) {
            sails.log.info(`Email: ${user.username}, name: ${user.name}, surname: ${user.surname}`);
        }
        if (notActiveUsersWrongContractEndDate.length > 0) {
            sails.log.info('....................................');
        }

        const util = require('util');

        // Reporting
        sails.log.info(disabledMemberships.length + ' memberships disabled!');
        sails.log.info(util.inspect(disabledMemberships, false, null, true));
        sails.log.info('....................................');

        sails.log.info(enabledMemberships.length + ' memberships enabled!');
        sails.log.info(util.inspect(enabledMemberships, false, null, true));
        sails.log.info('....................................');

        sails.log.info(deactivatedUsers.length + ' users deactivated!');
        sails.log.info(util.inspect(deactivatedUsers, false, null, true));
        sails.log.info('....................................');

        sails.log.info(activatedUsers.length + ' users activated!');
        sails.log.info(util.inspect(activatedUsers, false, null, true));
        sails.log.info('....................................');

        sails.log.info(createdUsers.length + ' users created!');
        sails.log.info(util.inspect(createdUsers, false, null, true));
        sails.log.info('....................................');

        sails.log.info(updatedUsers.length + ' users updated!');
        sails.log.info(util.inspect(updatedUsers, false, null, true));
        sails.log.info('....................................');

        sails.log.info(upToDateUsers.length + ' users up-to-date!');
        sails.log.info('....................................');

        sails.log.info(updatedResearchEntityDataItems.length + ' ResearchEntityData records updated!');
        sails.log.info(util.inspect(updatedResearchEntityDataItems, false, null, true));
        sails.log.info('....................................');

        sails.log.info(newResearchEntityDataItems.length + ' ResearchEntityData records created!');
        sails.log.info(util.inspect(newResearchEntityDataItems, false, null, true));
        sails.log.info('....................................');

        sails.log.info(upToDateResearchEntityDataItems.length + ' ResearchEntityData records are already up-to-date!');
        sails.log.info('....................................');

        sails.log.info('Stopped at ' + moment().utc().format());
    } catch (e) {
        sails.log.info('importUserContracts');
        sails.log.info(e);
    }
}

async function removeExpiredUsers() {
    const fiveYearsAgo = moment().utc().subtract('5', 'years').startOf('day');
    let deletedUsers = await User.destroy({
        contractEndDate: {'<=': fiveYearsAgo.format()}
    });
    deletedUsers = deletedUsers.map(function (user) {
        return JSON.stringify(user);
    });
    if (deletedUsers.length > 0) {
        if (deletedUsers.length === 1) {
            sails.log.info(`Deleted 1 user with a contract that ended 5 years ago: ${fiveYearsAgo.format()}`);
            sails.log.info(`Deleted the user with data: ${deletedUsers.join(', ')}`);
        } else {
            sails.log.info(`Deleted ${deletedUsers.length} users with a contract that ended 5 years ago: ${fiveYearsAgo.format()}`);
            sails.log.info(`Deleted the users with data: ${deletedUsers.join(', ')}`);
        }
    } else {
        sails.log.info(`Deleted 0 users with a contract that ended 5 years ago: ${fiveYearsAgo.format()}`);
    }
}

async function analyseUserImport() {
    let roleAssociations = await GeneralSettings.findOne({name: 'role-associations'});
    const ignoredRoles = getIgnoredRoles();
    const govAndControl = 'Gov. & Control';

    try {
        const options = getUserImportRequestOptions('employees');

        let employees = await getEmployees(options);

        if (!employees) {
            return;
        }

        sails.log.info(`Received contracts: ${employees.length}`);
        sails.log.info('....................................');

        const contractsWithoutSubArea = employees.filter(c => !_.has(c, 'desc_sottoarea') || _.isEmpty(c.desc_sottoarea)).map(c => sails.log.debug(c));
        sails.log.info(`Contracts without sub area: ${contractsWithoutSubArea.length}`);
        sails.log.info('....................................');

        const contractsWihoutLines = employees.filter(c => (!_.has(c, 'linea_1') || _.isEmpty(c.linea_1)) && c.desc_sottoarea !== govAndControl);
        sails.log.info(`Contracts without lines: ${contractsWihoutLines.length}`);
        sails.log.info('....................................');

        employees = await overrideCIDAssociations(employees);

        employees = employees.filter(e => _.has(e, 'desc_sottoarea') &&
            _.has(e, 'linea_1') &&
            _.has(e, 'stato_dip') &&
            (
                e.desc_sottoarea !== govAndControl ||
                e.desc_sottoarea === govAndControl && e.linea_1 === 'PRS001'
            ) &&
            e.stato_dip !== 'cessato' &&
            e.contratto_secondario !== 'X' &&
            !ignoredRoles.includes(e.Ruolo_AD)
        );

        sails.log.info(`Contracts after filtering out 'Gov. & Control', 'Secondary contracts' and 'ignored roles': ${employees.length}`);
        sails.log.info('....................................');

        const contractsWithoutEmail = employees.filter(c => _.isEmpty(c.email));
        //employees = employees.filter(c => !_.isEmpty(c.email));
        sails.log.info(`Contracts without email: ${contractsWithoutEmail.length}`);
        for (const c of contractsWithoutEmail) {
            sails.log.info(`Name: ${c.nome} Surname:${c.cognome}`);
        }
        sails.log.info('....................................');

        sails.log.info(`Contracts with email: ${employees.length}`);
        sails.log.info('....................................');

        const contractsWithoutRuolo1 = employees.filter(c => !_.has(c, 'Ruolo_1') || _.isEmpty(c.Ruolo_1));
        sails.log.info(`Contracts without Ruolo_1: ${contractsWithoutRuolo1.length}`);
        sails.log.info('....................................');

        const groupedRoles = _.chain(employees)
            .groupBy(e => e.Ruolo_1)
            .map((value, key) => ({role: key, employees: value}))
            .value();

        const totalEmployees = groupedRoles.reduce(function (accumulator, groupedRole) {
            return accumulator + groupedRole.employees.length;
        }, 0);
        sails.log.info(`Total found employees: ${totalEmployees}`);
        sails.log.info('....................................');

        roleAssociations = roleAssociations.data;
        roleAssociations = roleAssociations.map(a => ({
            originalRole: _.toLower(a.originalRole),
            roleCategory: _.toLower(a.roleCategory)
        }))
        roleAssociations = _.chain(roleAssociations)
            .groupBy(a => a.roleCategory)
            .map((value, key) => {
                return {
                    roleCategory: key,
                    originalRoles: roleAssociations.filter(a => a.roleCategory === key).map(a => a.originalRole)
                }
            })
            .value();

        for (const group of roleAssociations) {
            group.employees = [];

            for (const groupRole of groupedRoles) {
                const role = _.toLower(groupRole.role);
                const employees = groupRole.employees;

                if (group.originalRoles.includes(role)) {
                    group.employees = group.employees.concat(employees);
                }
            }
        }

        roleAssociations = _.orderBy(roleAssociations, 'employees.length').reverse();
        for (const group of roleAssociations) {
            sails.log.info(`Role: ${group.roleCategory}, employees: ${group.employees.length}`);
        }
        sails.log.info('....................................');

        const totalEmployees2 = roleAssociations.reduce(function (accumulator, roleAssociation) {
            return accumulator + roleAssociation.employees.length;
        }, 0);
        sails.log.info(`Total employees connected to a associated role: ${totalEmployees2}`);
        sails.log.info('....................................');

        let allUsers = await User.find({active: true});
        allUsers = allUsers.filter(u => u.role !== 'guest' && u.role !== 'evaluator');

        const foundUsers = [];
        for (const employee of employees) {
            const user = allUsers.find(u => u.name === employee.nome &&
                u.surname === employee.cognome &&
                u.username === employee.email
            );

            if (!user) {
                sails.log.info(`No user found with name: ${employee.nome}, surname: ${employee.cognome} and email: ${employee.email}`);
            } else {
                const tmpUser = {name: employee.nome, surname: employee.cognome, email: employee.email};
                if (foundUsers.find(u => JSON.stringify(u) === JSON.stringify(tmpUser))) {
                    sails.log.info(`Duplicate user in scheda persona: ${tmpUser.name} ${tmpUser.surname}`);
                } else {
                    foundUsers.push(tmpUser);
                }
            }
        }
        sails.log.info(`${foundUsers.length}/${employees.length} are active users`);
    } catch (e) {
        sails.log.info('analyseUserImport');
        sails.log.info(e);
    }
}

async function updateUserProfileGroups() {
    const groups = await Group.find();
    const chunk = 500;
    let i = 0;
    let researchEntityDataRecords = [];

    const changedGroups = [];
    const changedCenters = [];
    const changedResearchEntityDataRecords = [];

    do {
        researchEntityDataRecords = await ResearchEntityData.find().sort('id ASC').limit(chunk).skip(i * chunk);

        for (const researchEntityDataRecord of researchEntityDataRecords) {

            const originalProfile = _.cloneDeep(researchEntityDataRecord.profile);

            for (const profileGroup of researchEntityDataRecord.profile.groups) {

                const group = groups.find(group => group.code === profileGroup.code);

                if (group) {
                    if (profileGroup.name !== group.name) {
                        profileGroup.name = group.name;
                        changedGroups.push(group);
                    }

                    if (_.has(profileGroup, 'center.code') && _.has(profileGroup, 'center.name')) {

                        const center = groups.find(group => group.code === profileGroup.center.code);

                        if (profileGroup.center.name !== center.name) {
                            profileGroup.center.name = center.name;
                            changedCenters.push(center);
                        }
                    }
                }
            }

            for (const experience of researchEntityDataRecord.profile.experiencesInternal) {
                if (_.has(experience, 'lines')) {
                    for (const line of experience.lines) {
                        const group = groups.find(group => group.code === line.code);

                        if (group) {
                            if (line.name !== group.name) {
                                line.name = group.name;
                                changedGroups.push(group);
                            }
                        }
                    }
                }
            }

            if (JSON.stringify(originalProfile) !== JSON.stringify(researchEntityDataRecord.profile)) {
                await ResearchEntityData.update(
                    {id: researchEntityDataRecord.id},
                    {profile: JSON.stringify(researchEntityDataRecord.profile)}
                );

                researchEntityDataRecord = await ResearchEntityData.findOne({id: researchEntityDataRecord.id});

                changedResearchEntityDataRecords.push(researchEntityDataRecord);
            }
        }
        i++;
    } while (!_.isEmpty(researchEntityDataRecords));

    sails.log.info('Updated profiles: ' + changedResearchEntityDataRecords.length);
    if (!_.isEmpty(changedResearchEntityDataRecords)) {
        const researchEntityIds = changedResearchEntityDataRecords.map(r => r.researchEntity);
        const users = await User.find({researchEntity: researchEntityIds});
        sails.log.info('User(s): ' + users.map(user => user.username).join(', '));
    }

    const uniqueChangedGroups = changedGroups.reduce((acc, current) => {
        const x = acc.find(item => item.code === current.code);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    sails.log.info('Unique changed groups: ' + uniqueChangedGroups.length);
    if (!_.isEmpty(uniqueChangedGroups)) {
        sails.log.info('Codes: ' + uniqueChangedGroups.map(group => group.code).join(', '));
    }

    const uniqueChangedCenters = changedCenters.reduce((acc, current) => {
        const x = acc.find(item => item.code === current.code);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    sails.log.info('Unique changed centers: ' + uniqueChangedCenters.length);
    if (!_.isEmpty(uniqueChangedCenters)) {
        sails.log.info('Codes: ' + uniqueChangedCenters.map(group => group.code).join(', '));
    }
}

function isFormerGuestStudent(employee) {
    if (
        _.has(employee, 'stato_dip') &&
        employee.stato_dip === 'cessato' &&
        _.has(employee, 'Ruolo_AD') &&
        employee.Ruolo_AD === 'Guest Student'
    ) {
        return true;
    }

    return false;
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

    if (type === 'employees') {
        if (!options.params.email) {
            options.params.email = getDefaultEmail();
        }

        options.params.statodip = 'tutti';
    }

    return options;
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
        let response = await Utils.waitForSuccessfulRequest(options);

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
        throw e;
    }
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

// Private functions

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
            const response = await Utils.waitForSuccessfulRequest(options);
            handleResponse(response);
        }
    } catch (e) {
        sails.log.debug('importUserHistoryContracts:getContractualHistoryOfCIDCodes');
        throw e;
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
 function createUserObject(ldapUsers = [], user = {}, employee = {}) {

    const userObject = {
        cid: employee.cid,
        name: null,
        surname: null,
        jobTitle: null,
        lastsynch: moment().utc().format(),
        synchronized: true,
        contractEndDate: null
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

    if (_.has(employee, 'data_fine_rapporto')) {

        const date = moment(employee.data_fine_rapporto, getISO8601Format());

        if (date.isValid() && date.isBefore('9999-01-01')) {
            userObject.contractEndDate = date.format(getISO8601Format());
        }
    }

    if (_.has(employee, 'stato_dip') && employee.stato_dip === 'cessato') {
        if (_.has(user, 'id')) {
            userObject.username = `${user.id}@iit.it`;
        } else {
            userObject.username = `${employee.cid}@iit.it`;
        }
        userObject.active = false;
    } else {
        const foundEmployeeEmail = ldapUsers.find(u => _.toLower(u.userPrincipalName) === _.toLower(employee.email));

        if (_.isEmpty(foundEmployeeEmail)) {

            let keepCurrentUsername = false;

            if (user && _.has(user, 'username')) {
                const foundEmployeeEmail = ldapUsers.find(
                    ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(user.username)
                );
                if (!_.isEmpty(foundEmployeeEmail)) {
                    keepCurrentUsername = true;
                    sails.log.info(`The email address: ${employee.email} we received from Pentaho is not available in the Active Directory, but the old one does: ${user.username}`);
                }
            }

            if (!keepCurrentUsername) {
                userObject.username = null;
            }
        } else {
            userObject.username = _.toLower(employee.email)
        }
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
 * This function returns an array of codes.
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

/**
 * This function returns an user object or false if the user is not found.
 *
 * @param {Object}        employee               Employee contract object.
 *
 * @returns {Object|false}
 */
 async function findEmployeeUser(employee) {
    const condition = {
        active: true
    };

    let users = [];

    // By CID code
    if (_.has(employee, 'cid') && !_.isEmpty(employee.cid)) {
        users = await User.find(_.merge({
            cid: employee.cid
        }, condition));

        if (users.length === 1) {
            sails.log.debug(`Found ${users.length} user with the same CID code: ${employee.cid}, email: ${employee.email}, name: ${employee.nome}, surname: ${employee.cognome}`);
            return users[0];
        }

        if (users.length > 1) {
            sails.log.debug(`Found ${users.length} users with the same CID code: ${employee.cid}`);
            return false;
        }
    }

    return false;
}

/**
 * This function returns an user profile object created with the passed data.
 *
 * @param {Object}          researchEntityData
 * @param {Object}          contract
 * @param {Object[]}        allMembershipGroups     Array of Objects.
 * @param {Object[]}        activeGroups            Array of Objects.
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
 * This function compares the existing user and userObject created with the Pentaho data.
 *
 * @param {Object}        user               User object.
 * @param {Object}        userObject         User object with Pentaho data.
 *
 * @returns {false|true}
 */
function isUserEqualWithUserObject(user = {}, userObject = {}) {
    if (
        user.cid === userObject.cid &&
        user.name === userObject.name &&
        user.surname === userObject.surname &&
        user.jobTitle === userObject.jobTitle &&
        (
            (
                moment(user.contractEndDate, getISO8601Format()).isValid() &&
                moment(userObject.contractEndDate, getISO8601Format()).isValid() &&
                moment(user.contractEndDate, getISO8601Format()).isSame(moment(userObject.contractEndDate, getISO8601Format()))
            ) || (
                !moment(user.contractEndDate, getISO8601Format()).isValid() &&
                !moment(userObject.contractEndDate, getISO8601Format()).isValid() &&
                user.contractEndDate === null &&
                userObject.contractEndDate === null
            )
        ) &&
        user.username === userObject.username &&
        user.displayName === userObject.displayName &&
        user.displaySurname === userObject.displaySurname &&
        JSON.stringify(user.config) === JSON.stringify(userObject.config)
    ) {
        return true;
    }

    return false;
}

/**
 * This function replaces the CID of employees.
 *
 * @param {Object[]}        employees               Employee contract object.
 *
 * @returns {Object[]}
 */
async function overrideCIDAssociations(employees = [], email = getDefaultEmail()) {
    let foundAssociations = false;
    let cidAssociations = await GeneralSettings.findOne({ name: 'cid-associations' });

    if (_.has(cidAssociations, 'data')) {
        cidAssociations = cidAssociations.data;
    } else {
        cidAssociations = [];
    }

    if (email !== getDefaultEmail()) {
        cidAssociations = cidAssociations.filter(a => a.email === email);
    }

    for (const cidAssociation of cidAssociations) {
        const toBeIgnoredCIDs = employees.filter(e => e.email === cidAssociation.email && e.cid !== cidAssociation.cid)
            .map(e => e.cid);

        employees = employees.filter(e => !toBeIgnoredCIDs.includes(e.cid));

        const employee = employees.find(e => e.email === cidAssociation.email);
        foundAssociations = true;
        sails.log.info(`Found CID association for user ${employee.email}: ${employee.cid}`);
    }

    if (foundAssociations) {
        sails.log.info('....................................');
    }

    return employees;
}

/**
 * This function checks for missing CID associations:
 * It looks for active employees with the same email address that are not empty.
 *
 * @param {Object[]}        employees               Employee contract object.
 */
function getMissingCIDAssociations(employees = []) {
    const uniqueEmployeesWithEmail = [];
    let foundDuplicates = false;
    const employeesWithoutFormer = employees.filter(e => !_.isEmpty(e.email) &&
        !(
            _.has(e, 'stato_dip') &&
            e.stato_dip === 'cessato'
        )
    );
    for (const employee of employeesWithoutFormer) {
        if (!uniqueEmployeesWithEmail.includes(employee.email)) {
            uniqueEmployeesWithEmail.push(employee.email);
        } else {
            foundDuplicates = true;
            sails.log.info(`Already found an employee with this email ${employee.email}, you should add an CID association in the admin section!`);
        }
    }

    if (foundDuplicates) {
        sails.log.info('....................................');
    }
}