"use strict";

const _ = require('lodash');

module.exports = {
    importUsers,
    removeExpiredUsers,
    analyseUserImport,
    updateUserProfileGroups,
    getUserImportRequestOptions,
    getEmployees,
    filterEmployees
};

const moment = require('moment');
moment.locale('en');

const valuePublicPrivacy = 'public';

const convert = require('xml-js');

const path = require('path');
const util = require('util');
const fs = require('fs');
const GroupTypes = require('./GroupTypes');

const writeFile = util.promisify(fs.writeFile);
const readdir = util.promisify(fs.readdir);
const unlink = util.promisify(fs.unlink);

const logDirectory = path.join('logs', 'userImport');

async function importUsers(email = getDefaultEmail()) {

    const logMethod = 'importUsers';
    const startedTime = moment();
    const newMemberships = [];
    const updatedMemberships = [];
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

    await Utils.log('The import started at ' + startedTime.format(), logMethod);
    await Utils.log('....................................', logMethod);

    try {
        // Endpoint options to get all users
        const options = getUserImportRequestOptions('employees', {email});

        // Get all the employees from Pentaho.
        let originalEmployees = await getEmployees(options, logMethod, false);
        let employees = _.cloneDeep(originalEmployees);

        if (email !== getDefaultEmail()) {
            employees = employees.filter(e => e.email === email);
        }

        // Override the CID of specified employees
        employees = await overrideCIDAssociations(employees, email, logMethod);

        // Filter out employees with a invalid email, a secondary contract or ignored role
        employees = filterEmployees(employees);

        // Filter out invalid email addresses, use the cid as temporary email address
        let showLine = false;
        employees = employees.filter(async employee => {
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
                    await Utils.log(`Missing email for employee ${employee.nome} ${employee.cognome}`, logMethod);
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
            await Utils.log('....................................', logMethod);
        }

        // Check if there are multiple active employees with the same email address (excluding empty email addresses) in the employees array
        await getMissingCIDAssociations(employees, logMethod);

        // We cache the groups, membership groups and default profile.
        const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
        let ldapUsers = await Utils.getActiveDirectoryUsers();
        await Utils.log(`Found ${ldapUsers.length} records in the Active Directory`, logMethod);

        const groups = await Group.find();
        if (groups.length <= 0) {
            await Utils.log('No groups found...', logMethod);
        }

        const activeGroups = groups.filter(g => g.active === true);

        // Get all CID codes in one Array
        const cidCodes = employees.map(employee => employee.cid);
        await Utils.log('Found ' + cidCodes.length + ' CID codes!', logMethod);
        await Utils.log('....................................', logMethod);

        // Get the contractual history of the CID codes
        const historyContracts = await getContractualHistoryOfCidCodes(cidCodes, logMethod, false);

        if (historyContracts.length === 0) {
            return;
        }

        // Add the contract to the employees
        for (const contract of historyContracts) {
            if (_.has(contract, 'step')) {
                const employee = employees.find(e => e.cid === contract.cid);
                if (employee) {
                    if (!_.has(employee, 'contract')) {
                        employee.contract = [contract];
                    } else {
                        employee.contract.push(contract);
                    }
                }
            } else {
                await Utils.log(`Contract doesn't have any steps: ${employee.email} ${employee.cid}`, logMethod);
            }
        }

        // Only keep the employees with a contract
        employees = employees.filter(e => _.has(e, 'contract'));

        // Merge the duplicate employees
        employees = mergeDuplicateEmployees(employees);

        await Utils.log(`Looping over ${employees.length} employees...`, logMethod);

        for (const employee of employees) {

            // Take first contract
            const contract = _.head(employee.contract);

            // Skip employee if the contract has no step or cid
            if (!_.has(contract, 'step') || !_.has(contract, 'cid')) {
                continue;
            }

            // Replace empty objects by empty strings
            if (_.isArray(contract.step)) {
                for (const step of contract.step) {
                    replaceEmptyObjectByEmptyString(step);
                    replaceEmptyObjectByEmptyString(step.linea);
                }
            } else {
                replaceEmptyObjectByEmptyString(contract.step);
                replaceEmptyObjectByEmptyString(contract.step.linea);
            }

            let handledSteps = mergeStepsOfContract(contract, groups);
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

            const userObject = await createUserObject(ldapUsers, user, employee, logMethod);
            if (!userObject) {
                Utils.log(`Skipped employee ${employee.email} because of an empty user object`, logMethod, false);
                continue;
            }

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
                    await User.update({id: user.id}, {lastsynch: moment().format()});
                    user = await User.findOne({id: user.id});
                    upToDateUsers.push(user);
                }

                if (
                    user.displayName !== employee.nome_AD ||
                    user.displaySurname !== employee.cognome_AD
                ) {
                    await User.createAliases(user);
                    await Utils.log(`Create aliases for ${user.username}`, logMethod);
                }
            }

            if (!user) {
                await Utils.log('No user!', logMethod);
                continue;
            }

            if (!user.id) {
                await Utils.log(user, logMethod, false);
            }

            const groupCodesOfContract = collectGroupCodes(employee);

            // Get the groups of the active contract
            const groupsOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                return _.toLower(groupCode) === _.toLower(group.code)
            }));

            for (let group of groupsOfContract) {
                const condition = {
                    user: user.id,
                    group: group.id
                };
                let membership = await Membership.findOne(condition);

                if (_.has(employee, 'stato_dip') && employee.stato_dip !== 'cessato') {
                    if (!membership) {
                        membership = await Group.addMember(group, user);
                    }

                    await Membership.update(condition, {
                        lastsynch: moment().format(),
                        active: true
                    });
                    const updatedMembership = await Membership.findOne(condition);

                    if (!membership.active) {
                        enabledMemberships.push(updatedMembership);
                    }
                } else {
                    if (!membership) {
                        await Membership.create({
                            user: user.id,
                            group: group.id,
                            lastsynch: moment().format(),
                            synchronized: true,
                            active: false
                        });
                    }
                }
            }

            // Get the groups of the history contracts
            let uniqueSteps = [];

            function handleLine(step, line, employee) {
                if (_.has(line, 'codice')) {
                    let active = false;
                    let code = line.codice;

                    if (
                        _.has(employee, 'stato_dip') &&
                        employee.stato_dip !== 'cessato' && (
                            moment(step.data_fine, 'DD/MM/YYYY').isAfter(moment()) ||
                            moment(step.data_fine, 'DD/MM/YYYY').isSame(moment(), 'day')
                        )
                    ) {
                        active = true;
                    }

                    function handleStep(code, active) {
                        const uniqueStep = uniqueSteps.find(step => step.code === code);
                        if (uniqueStep) {
                            uniqueStep.active = active;
                        } else {
                            uniqueSteps.push({
                                code,
                                active
                            });
                        }
                    }

                    handleStep(code, active);

                    if (_.has(line, 'UO') && line.UO === 'IIT') {
                        code = 'IIT1.01DS';
                        handleStep(code, active);
                    }
                }
            }

            let steps = [];
            if (_.isArray(contract.step)) {
                steps = contract.step.filter(step => _.has(step, 'data_fine') &&
                    _.has(step, 'data_inizio') &&
                    !moment(step.data_inizio, 'DD/MM/YYYY').isAfter(moment())
                );
                steps = steps.sort(function (a, b) {
                    const dateA = moment(a.data_fine, 'DD/MM/YYYY');
                    const dateB = moment(b.data_fine, 'DD/MM/YYYY');
                    return dateA.isAfter(dateB);
                });
            } else {
                steps.push(contract.step);
            }

            steps.forEach(step => {
                if (!_.has(step, 'linea') || !_.has(step, 'data_fine') || !_.has(step, 'data_inizio')) {
                    return;
                }

                if (_.isArray(step.linea)) {
                    step.linea.forEach(line => {
                        handleLine(step, line, employee);
                    });
                } else {
                    handleLine(step, step.linea, employee);
                }
            });

            // Filter out the groups that are set by the profile in scheda_persona because some contracts are in the past but should be active,
            const groupsOfContractCodes = groupsOfContract.map(group => group.code);
            uniqueSteps = uniqueSteps.filter(s => !groupsOfContractCodes.includes(s.code));

            for (const step of uniqueSteps) {
                const group = groups.find(group => group.code === step.code);

                if (group) {
                    const condition = {
                        user: user.id,
                        group: group.id
                    };

                    let membership = await Membership.findOne(condition);

                    if (membership) {
                        if (
                            (!membership.synchronized && membership.active && !step.active) ||
                            (membership.synchronized === true && membership.active === step.active)
                        ) {
                            await Membership.update(condition, {
                                lastsynch: moment().format()
                            });
                        } else {
                            const updatedMembership = await Membership.update(condition, {
                                lastsynch: moment().format(),
                                active: step.active,
                                synchronized: true
                            });
                            updatedMemberships.push(updatedMembership);
                        }
                    } else {
                        await Utils.log('Add missing membership', logMethod);
                        const newMembership = await Membership.create({
                            user: user.id,
                            group: group.id,
                            lastsynch: moment().format(),
                            synchronized: true,
                            active: step.active
                        });
                        newMemberships.push(newMembership);
                    }
                }
            }

            if (_.has(employee, 'stato_dip') && employee.stato_dip !== 'cessato') {
                // Disable all the memberships of the user and the groups where the user doesn't have a contract of
                const groupsOfContractIds = groupsOfContract.map(group => group.id);
                const activeMembershipsOfUser = await Membership.find({
                    user: user.id,
                    active: true,
                    synchronized: true
                });

                const disabledMembershipsOfUser = activeMembershipsOfUser.filter(m => !groupsOfContractIds.includes(m.group));
                for (let membership of disabledMembershipsOfUser) {
                    await Membership.update({
                        id: membership.id,
                    }, {
                        lastsynch: moment().format(),
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
                    lastsynch: moment().format(),
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

                // This should not be in the profile, will be added in the toJSON of the UserData model
                delete profile.experiences;
                delete researchEntityData.experiences;

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

        await Utils.log('....................................', logMethod);

        // Check if a user is active but we expected not active
        const notExpectedActiveUsersCondition = {
            lastsynch: {'<': startedTime.format()},
            synchronized: true,
            active: true
        };

        if (email !== getDefaultEmail()) {
            notExpectedActiveUsersCondition.username = email;
        }

        const notExpectedActiveUsers = await User.find(notExpectedActiveUsersCondition);
        if (notExpectedActiveUsers.length > 0) {
            if (notExpectedActiveUsers.length === 1) {
                await Utils.log(`Found ${notExpectedActiveUsers.length} user that is active but expected not to be active, please check manually:`, logMethod);
            } else {
                await Utils.log(`Found ${notExpectedActiveUsers.length} users that are active but expected not to be active, please check manually:`, logMethod);
            }
        }
        for (const user of notExpectedActiveUsers) {
            await Utils.log(`Email: ${user.username}, name: ${user.name}, surname: ${user.surname}`, logMethod);
        }
        if (notExpectedActiveUsers.length > 0) {
            await Utils.log('....................................', logMethod);
        }

        // Check if a user has a contract end date greater than now + 1 year.
        const notActiveUsersWrongContractEndDate = await User.find({
            active: false,
            contractEndDate: {'>': moment().format()},
        });
        if (notActiveUsersWrongContractEndDate.length > 0) {
            await Utils.log(`Found ${notActiveUsersWrongContractEndDate.length} users that has to be checked manually`, logMethod);
        }
        for (const user of notActiveUsersWrongContractEndDate) {
            await Utils.log(`Email: ${user.username}, name: ${user.name}, surname: ${user.surname}`, logMethod);
        }
        if (notActiveUsersWrongContractEndDate.length > 0) {
            await Utils.log('....................................', logMethod);
        }

        await SqlService.refreshMaterializedView('person');
        sails.log.debug('Refreshed person view...');

        // Reporting
        await Utils.log(newMemberships.length + ' memberships created!', logMethod);
        await Utils.log(util.inspect(newMemberships, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(updatedMemberships.length + ' memberships updated!', logMethod);
        await Utils.log(util.inspect(updatedMemberships, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(disabledMemberships.length + ' memberships disabled!', logMethod);
        await Utils.log(util.inspect(disabledMemberships, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(enabledMemberships.length + ' memberships enabled!', logMethod);
        await Utils.log(util.inspect(enabledMemberships, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(deactivatedUsers.length + ' users deactivated!', logMethod);
        await Utils.log(util.inspect(deactivatedUsers, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(activatedUsers.length + ' users activated!', logMethod);
        await Utils.log(util.inspect(activatedUsers, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(createdUsers.length + ' users created!', logMethod);
        await Utils.log(util.inspect(createdUsers, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(updatedUsers.length + ' users updated!', logMethod);
        await Utils.log(util.inspect(updatedUsers, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(upToDateUsers.length + ' users up-to-date!', logMethod);
        await Utils.log('....................................', logMethod);

        await Utils.log(updatedResearchEntityDataItems.length + ' ResearchEntityData records updated!', logMethod);
        await Utils.log(util.inspect(updatedResearchEntityDataItems, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(newResearchEntityDataItems.length + ' ResearchEntityData records created!', logMethod);
        await Utils.log(util.inspect(newResearchEntityDataItems, false, null, true), logMethod, false);
        await Utils.log('....................................', logMethod);

        await Utils.log(upToDateResearchEntityDataItems.length + ' ResearchEntityData records are already up-to-date!', logMethod);
        await Utils.log('....................................', logMethod);

        await Utils.log('Stopped at ' + moment().format(), logMethod);
    } catch (e) {
        await Utils.log('importUserContracts', logMethod);
        await Utils.log(e, logMethod);
    }
}

async function removeExpiredUsers() {
    const fiveYearsAgo = moment().subtract('5', 'years').startOf('day');
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
    let roleAssociations = await GeneralSetting.findOne({name: 'role-associations'});
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
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const groups = await Group.find();
    const activeGroups = groups.filter(g => g.active === true);
    const chunk = 500;
    let i = 0;
    let researchEntityDataRecords = [];
    const changedResearchEntityDataRecords = [];

    do {
        researchEntityDataRecords = await ResearchEntityData.find().sort('id ASC').limit(chunk).skip(i * chunk);
        researchEntityDataRecords = researchEntityDataRecords.filter(r => !_.isNull(r.profile))
        for (const researchEntityDataRecord of researchEntityDataRecords) {

            let defaultPrivacy = valuePublicPrivacy;
            if (researchEntityDataRecord.profile.hidden) {
                defaultPrivacy = getValueHiddenPrivacy();
            }

            const originalProfile = _.cloneDeep(researchEntityDataRecord.profile);

            researchEntityDataRecord.profile.groups = getProfileGroups(allMembershipGroups, activeGroups, researchEntityDataRecord.importedData, defaultPrivacy);

            for (const experience of researchEntityDataRecord.profile.experiencesInternal) {
                if (_.has(experience, 'lines')) {
                    for (const line of experience.lines) {
                        const group = groups.find(group => group.code === line.code);

                        if (group) {
                            if (!_.isEqual(line.name, group.name)) {
                                line.name = group.name;
                            }
                        }
                    }
                }
            }

            if (!_.isEqual(originalProfile, researchEntityDataRecord.profile)) {
                await ResearchEntityData.update(
                    {id: researchEntityDataRecord.id},
                    {profile: JSON.stringify(researchEntityDataRecord.profile)}
                );

                const researchEntityData = await ResearchEntityData.findOne({id: researchEntityDataRecord.id});

                changedResearchEntityDataRecords.push(researchEntityData);
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

    options.responseEncoding = 'latin1';

    const trans = (type === 'history') ? '/public/storico_contrattuale_UO_node' : '/public/scheda_persona_flat';
    options.params = Object.assign({
            rep: 'PROD',
            trans,
            output: 'xml'
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
async function getEmployees(options, logMethod = false, print = false) {
    try {
        let xml = await Utils.waitForSuccessfulRequest(options, logMethod, print);

        let response = convert.xml2js(xml, {compact: true, spaces: 4, textFn: RemoveJsonTextAttribute});

        if (!_.has(response, 'scheda_persona.scheda') || _.isEmpty(response.scheda_persona.scheda)) {
            return false;
        }

        response = response.scheda_persona.scheda;

        // Replace empty objects with empty string
        if (_.isArray(response)) {
            for (const employee of response) {
                replaceEmptyObjectByEmptyString(employee);
            }
        } else {
            replaceEmptyObjectByEmptyString(response);
        }

        if (_.has(sails, 'config.scientilla.userImport.debug') && sails.config.scientilla.userImport.debug) {

            const files = await readdir(logDirectory);
            for (const file of files) {
                if (file.endsWith('.log')) {
                    await unlink(path.join(logDirectory, file));
                }
            }

            const userLog = {
                request: {
                    url: options.url,
                    headers: options.headers,
                    params: options.params
                },
                xml: xml,
                response: response
            };
            await writeFile(path.join(logDirectory, 'employees.log'), JSON.stringify(userLog, null, 4));
        }

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

function replaceEmptyObjectByEmptyString(object) {
    // Replace empty objects with empty string
    for (const [key, value] of Object.entries(object)) {
        if (_.isObject(value) && _.isEmpty(value)) {
            object[key] = '';
        }
    }
}

/**
 * Get the contractual history for an array of cid codes
 *
 * @param {String[]}    codes   Array of strings.
 *
 * @returns {Object[]}
 */
// This function will return an array of valid contracts
async function getContractualHistoryOfCidCodes(codes, logMethod = false, print = false) {

    let contracts = [];
    const chunkLength = 250;

    function handleResponse(response) {
        if (_.has(response, 'StoricoContrattuale.CID') && !_.isEmpty(response.StoricoContrattuale.CID)) {
            const cids = response.StoricoContrattuale.CID;

            if (_.isArray(cids)) {
                for (const contract of cids) {
                    if (_.has(contract, 'step')) {
                        // Replace empty objects with empty string
                        replaceEmptyObjectByEmptyString(contract)

                        contracts.push(contract);
                    }
                }
            } else {
                if (_.has(cids, 'step')) {
                    // Replace empty objects with empty string
                    replaceEmptyObjectByEmptyString(cids)

                    contracts.push(cids);
                }
            }
        }
    }

    // We need to split the CID codes into chunks because
    // the Pentaho API endpoint cannot handle a large group of CID codes.
    try {
        const groups = _.chunk(codes, chunkLength);
        let count = 1;
        for (const group of groups) {
            const options = getUserImportRequestOptions('history', {cid: group.join(',')});
            const xml = await Utils.waitForSuccessfulRequest(options, logMethod, print);
            const response = convert.xml2js(xml, {compact: true, spaces: 4, textFn: RemoveJsonTextAttribute});
            handleResponse(response);

            if (_.has(sails, 'config.scientilla.userImport.debug') && sails.config.scientilla.userImport.debug) {
                const historyLog = {
                    request: {
                        url: options.url,
                        headers: options.headers,
                        params: options.params
                    },
                    xml: xml,
                    response: response
                };
                await writeFile(path.join(logDirectory, `history-${count}.log`), JSON.stringify(historyLog, null, 4));
            }
            count++;
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
function mergeStepsOfContract(contract, groups = []) {

    const handledSteps = [];

    // Check if there are more steps
    if (_.isArray(contract.step)) {
        const steps = _.orderBy(contract.step, function (step) {
            return new moment(step.from, getISO8601Format()).format(getISO8601Format());
        }, ['desc']);

        // Loop over the steps
        for (const step of steps) {

            // Handle the step
            const handledStep = handleStep(step, groups);

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
        const handledStep = handleStep(contract.step, groups);

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
function handleStep(step, groups = []) {
    if (
        _.has(step, 'linea') &&
        _.has(step, 'stato') &&
        (step.stato === 'in forza' || step.stato === 'sospeso')
    ) {
        const handledStep = {
            from: null,
            jobTitle: null,
            lines: []
        };

        if (_.has(step, 'data_inizio')) {
            // Skip step if it is one of the future
            if (moment(step.data_inizio, 'DD/MM/YYYY').isAfter(moment())) {
                return;
            }

            handledStep.from = moment(step.data_inizio, 'DD/MM/YYYY').format(getISO8601Format());
        }

        if (_.has(step, 'data_fine')) {
            const to = moment(step.data_fine, 'DD/MM/YYYY');

            if (!moment('31/12/9999', 'DD/MM/YYYY').isSame(to)) {
                handledStep.to = to.format(getISO8601Format());
            }
        }

        if (_.has(step, 'Ruolo_AD')) {
            handledStep.jobTitle = step.Ruolo_AD;
        }

        const lines = step.linea;

        function getLine(line, groups) {
            const tmpLine = {};
            let group = false;
            if (_.has(line, 'codice')) {
                tmpLine.code = line.codice;
            }

            if (_.has(line, 'ufficio')) {
                if (_.lowerCase(line.ufficio) === 'iit') {
                    tmpLine.code = 'IIT1.01DS';
                    tmpLine.institute = line.ufficio;
                } else {
                    tmpLine.office = line.ufficio;
                }
            }

            if (_.has(tmpLine, 'code')) {
                group = groups.find(g => g.code === tmpLine.code);
            }

            if (group) {
                tmpLine.name = group.name;
            } else {
                if (_.has(line, 'nome')) {
                    tmpLine.name = line.nome;
                }
            }

            if (!_.isEmpty(tmpLine)) {
                return tmpLine;
            }
        }

        if (_.isArray(lines)) {
            let tmpLines = lines.map(line => getLine(line, groups)).filter(line => line !== undefined);
            tmpLines = _.orderBy(tmpLines, 'percentage', 'desc');
            tmpLines.forEach(line => delete line.percentage);

            handledStep.lines = tmpLines;
        } else {
            const newLine = getLine(lines, groups);

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
async function createUserObject(ldapUsers = [], user = {}, employee = {}, logMethod = false) {

    const userObject = {
        cid: employee.cid,
        name: null,
        surname: null,
        jobTitle: null,
        lastsynch: moment().format(),
        synchronized: true,
        contractEndDate: null,
        legacyEmail: null
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

        const date = moment(employee.data_fine_rapporto, 'YYYY-MM-DD');

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

        if (!foundEmployeeEmail) {

            let keepCurrentUsername = false;

            if (user && _.has(user, 'username')) {
                const foundEmployeeEmail = ldapUsers.find(
                    ldapUser => _.toLower(ldapUser.userPrincipalName) === _.toLower(user.username)
                );

                if (foundEmployeeEmail) {
                    keepCurrentUsername = true;
                    await Utils.log(`The email address: ${employee.email} we received from Pentaho is not available in the Active Directory, but the old one does: ${user.username}`, logMethod);
                }
            }

            if (!keepCurrentUsername) {
                return;
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

    if (_.has(employee, 'email')) {
        userObject.legacyEmail = employee.email;
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
    for (let i = 1; i <= 9; i++) {
        if (!_.isEmpty(contract['linea_' + i]) && !_.isEmpty(contract['UO_' + i])) {
            if (contract['UO_' + i] === 'IIT') {
                codes.push('IIT1.01DS');
            }

            codes.push(contract['linea_' + i]);
        }
    }
    return codes;
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
    const profile = ResearchEntityData.setupUserProfile(researchEntityData);

    if (!profile) {
        return;
    }

    profile.hidden = (contract.no_people === 'NO PEOPLE' ? true : false);

    let defaultPrivacy = valuePublicPrivacy;
    if (profile.hidden) {
        defaultPrivacy = getValueHiddenPrivacy();
    }

    let name = _.isObject(contract.nome) ? '' : contract.nome;
    if (!_.isEmpty(contract.nome_AD)) {
        name = contract.nome_AD;
    }

    let surname = _.isObject(contract.cognome) ? '' : contract.cognome;
    if (!_.isEmpty(contract.cognome_AD)) {
        surname = contract.cognome_AD;
    }

    profile.username = {
        privacy: defaultPrivacy,
        value: _.isObject(contract.email) ? '' : contract.email
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
        value: _.isObject(contract.telefono) ? '' : contract.telefono
    };
    profile.jobTitle = {
        privacy: defaultPrivacy,
        value: _.isObject(contract.Ruolo_AD) ? '' : contract.Ruolo_AD
    };
    profile.roleCategory = {
        privacy: defaultPrivacy,
        value: _.isObject(contract.Ruolo_1) ? '' : contract.Ruolo_1
    };
    profile.gender = {
        privacy: defaultPrivacy,
        value: _.isObject(contract.genere) ? '' : contract.genere
    };
    profile.nationality = {
        privacy: getValueHiddenPrivacy(),
        value: _.isObject(contract.nazionalita) ? '' : contract.nazionalita
    };
    profile.dateOfBirth = {
        privacy: getValueHiddenPrivacy(),
        value: _.isObject(contract.data_nascita) ? '' : moment(contract.data_nascita, 'YYYYMMDD').format('YYYY-MM-DD')
    };

    profile.groups = getProfileGroups(allMembershipGroups, activeGroups, contract, defaultPrivacy);

    return profile;
}

/**
 * This function returns an array with the groups of the user's contract.
 *
 * @param {Object[]}      allMembershipGroups               array of all memberships of groups.
 * @param {Object[]}      activeGroups                      array of active groups.
 * @param {Object}        contract                          User contract object.
 * @param {String}        defaultPrivacy                    Default privacy string.
 *
 * @returns {object[]}
 */
function getProfileGroups(allMembershipGroups, activeGroups, contract, defaultPrivacy) {

    const groups = [];
    const lines = [];

    for (let i = 1; i <= 9; i++) {
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
                group.type = GroupTypes.INSTITUTE;
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
                // This will return the first parent group of type center.
                const membershipGroup = allMembershipGroups.find(g =>
                    g.child_group === codeGroup.id &&
                    g.parent_group &&
                    g.parent_group.active &&
                    g.parent_group.type === GroupTypes.CENTER
                );

                if (_.has(membershipGroup, 'parent_group')) {
                    group.center = {
                        name: membershipGroup.parent_group.name,
                        code: membershipGroup.parent_group.code,
                        privacy: defaultPrivacy
                    };
                }
            }
        } else {
            group.type = GroupTypes.INSTITUTE;
            group.name = 'Istituto Italiano di Tecnologia';
            group.code = 'IIT';
            group.privacy = defaultPrivacy;
        }

        groups.push(group);
    }

    return groups;
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
                user.contractEndDate !== null &&
                userObject.contractEndDate !== null &&
                moment(user.contractEndDate, getISO8601Format()).isValid() &&
                moment(userObject.contractEndDate, getISO8601Format()).isValid() &&
                moment.utc(userObject.contractEndDate, getISO8601Format()).isSame(moment.utc(user.contractEndDate, getISO8601Format()))
            ) || (
                user.contractEndDate === null &&
                userObject.contractEndDate === null
            )
        ) &&
        user.username === userObject.username &&
        user.displayName === userObject.displayName &&
        user.displaySurname === userObject.displaySurname &&
        user.legacyEmail === userObject.legacyEmail &&
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
async function overrideCIDAssociations(employees = [], email = getDefaultEmail(), logMethod = false) {
    let foundAssociations = false;
    let cidAssociations = await GeneralSetting.findOne({name: 'cid-associations'});

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
        employee.cid = cidAssociation.cid;
        foundAssociations = true;
        await Utils.log(`Found CID association for user ${employee.email}: ${employee.cid}`, logMethod);
    }

    if (foundAssociations) {
        await Utils.log('....................................', logMethod);
    }

    return employees;
}

/**
 * This function checks for missing CID associations:
 * It looks for active employees with the same email address that are not empty.
 *
 * @param {Object[]}        employees               Employee contract object.
 */
async function getMissingCIDAssociations(employees = [], logMethod = false) {
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
            await Utils.log(`Already found an employee with this email ${employee.email}, you should add an CID association in the admin section!`, logMethod);
        }
    }

    if (foundDuplicates) {
        await Utils.log('....................................', logMethod);
    }
}

/**
 * Removes the text attribute
 *
 * @param {String}        value               value of element.
 * @param {Object}        parentElement       parent element.
 */
function RemoveJsonTextAttribute(value, parentElement) {
    try {
        const keyNo = Object.keys(parentElement._parent).length;
        const keyName = Object.keys(parentElement._parent)[keyNo - 1];
        parentElement._parent[keyName] = value;
    } catch (e) {
    }
}
