/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator */
/* global MembershipGroup, GroupTypes, ResearchEntityData, ResearchItemTypes, ResearchItem, ResearchItemKinds, Project */
/* global Verify, Membership, MembershipGroup, GroupTypes, ResearchEntityData, Utils, ImportHelper */

// Importer.js - in api/services

"use strict";

module.exports = {
    importSources,
    importGroups,
    importSourceMetrics,
    importUserContracts,
    removeExpiredUsers,
    importProjects
};

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');

const moment = require('moment');
moment.locale('en');

async function importSources() {

    function readWorksheet(worksheet, mappingsTable, mapFn = _.identity, filterFn = _.stubTrue) {
        function readSourceRow(r) {
            const sourceData = {};
            _.forEach(mappingsTable, (col, field) => {
                const cell = col + r;
                if (!_.isUndefined(worksheet[cell]))
                    sourceData[field] = worksheet[cell]['v'];
            });
            return sourceData;
        }

        const sources = [];
        for (let r = 2; ; r++) {
            const sourceData = readSourceRow(r);
            if (_.isEmpty(sourceData))
                break;
            const mappedSourceData = mapFn(sourceData);
            if (filterFn(mappedSourceData))
                sources.push(mappedSourceData);
        }
        return sources;
    }

    const scopusSourcesFileName = 'config/init/scopus_sources.xlsx';
    let journalsAndBookSeries = [], newConferences = [], oldConferences = [];
    if (fs.existsSync(scopusSourcesFileName)) {
        const workbook = xlsx.readFile(scopusSourcesFileName);
        const sheetNameList = workbook.SheetNames;

        const journalWorksheet = workbook.Sheets[sheetNameList[0]];
        const journalMappingsTable = {
            "title": 'B',
            "scopusId": 'A',
            "issn": 'C',
            "eissn": 'D',
            "type": 'T',
            "publisher": 'Z'
        };

        const mapJournal = (s) => {
            const sourceMappingTable = {
                'Book Series': SourceTypes.BOOKSERIES,
                'Journal': SourceTypes.JOURNAL
            };
            s.type = sourceMappingTable[s.type];
            return s;
        };

        const filterJournals = (s) => s.type;

        journalsAndBookSeries = readWorksheet(journalWorksheet, journalMappingsTable, mapJournal, filterJournals);

        const newConferencesWorksheet = workbook.Sheets[sheetNameList[1]];
        const newConferencesMappingsTable = {
            "title": 'B',
            "scopusId": 'A',
            "issn": 'D'
        };
        const mapConference = s => {
            s.type = SourceTypes.CONFERENCE;
            return s;
        };
        newConferences = readWorksheet(newConferencesWorksheet, newConferencesMappingsTable, mapConference);

        const oldConferencesWorksheet = workbook.Sheets[sheetNameList[2]];
        const oldConferencesMappingsTable = newConferencesMappingsTable;
        oldConferences = readWorksheet(oldConferencesWorksheet, oldConferencesMappingsTable, mapConference);
    }


    let books = [];
    const scopusSourcesFileName2 = 'config/init/scopus_book_sources.xlsx';
    if (fs.existsSync(scopusSourcesFileName2)) {
        const workbook2 = xlsx.readFile(scopusSourcesFileName2);
        const sheetNameList2 = workbook2.SheetNames;

        const bookWorksheet = workbook2.Sheets[sheetNameList2[0]];
        const bookMappingsTable = {
            "title": 'A',
            "isbn": 'C',
            "publisher": 'D',
            "year": 'E'
        };

        const mapBook = (s) => {
            s.type = 'book';
            return s;
        };

        books = readWorksheet(bookWorksheet, bookMappingsTable, mapBook);
    }

    const sources = _.union(journalsAndBookSeries, newConferences, oldConferences, books);

    sails.log.info('Inserting ' + sources.length + ' new sources');
    await Source.create(sources);
}

async function importGroups() {
    sails.log.info('Group import started');

    const researchDomains = [];
    const url = sails.config.scientilla.mainInstituteImport.officialGroupsImportUrl;
    const reqOptions = {
        uri: url,
        json: true
    };

    let res;
    try {
        res = await request(reqOptions);
    } catch (e) {
        sails.log.debug('importGroups');
        sails.log.debug(e);
    }
    const {
        research_domains: researchDomainsData,
        research_structures: researchStructuresData
    } = res;

    await Attribute.destroy({
        key: {'!': researchDomainsData.map(rd => rd.code)},
        category: 'research_domain'
    });
    for (const rdData of researchDomainsData) {
        let researchDomain = await Attribute.findOrCreate({
            key: rdData.code,
            category: 'research_domain'
        });
        researchDomain = await Attribute.update({id: researchDomain.id}, {value: rdData});
        researchDomains.push(researchDomain[0]);
    }

    for (const rsData of researchStructuresData) {
        const group = await Group.findOrCreate({code: rsData.cdr});
        await Group.update({id: group.id}, {
            name: rsData.description,
            type: rsData.type,
            starting_date: rsData.start_date,
            slug: rsData.slug,
            active: true
        });

        //PI
        if (Array.isArray(rsData.pis) && rsData.pis.length > 0) {
            const pis = await User.find({username: rsData.pis.map(p => p.email)});

            if (pis && pis.length) {
                await PrincipalInvestigator.destroy({
                    group: group.id,
                    pi: {'!': pis.map(p => p.id)}
                });

                for (const pi of pis) {
                    await GroupAdministrator.findOrCreate({
                        administrator: pi.id,
                        group: group.id
                    });

                    await PrincipalInvestigator.findOrCreate({
                        pi: pi.id,
                        group: group.id
                    });
                }
            } else
                await PrincipalInvestigator.destroy({group: group.id});
        } else
            await PrincipalInvestigator.destroy({group: group.id});

        //center
        const membershipGroups = await MembershipGroup.find({child_group: group.id}).populate('parent_group');
        const oldCentersMG = membershipGroups.filter(mg => mg.parent_group.type === GroupTypes.CENTER);

        if (rsData.center && rsData.center.code) {
            const center = await Group.findOrCreate({code: rsData.center.code});
            await Group.update({id: center.id}, {
                name: rsData.center.name,
                type: GroupTypes.CENTER
            });

            const toDeleteIds = oldCentersMG.filter(mg => mg.parent_group.id !== center.id).map(mg => mg.id);
            if (toDeleteIds.length > 0)
                await MembershipGroup.destroy({id: toDeleteIds});

            if (!oldCentersMG.find(mg => mg.parent_group.id === center.id))
                await MembershipGroup.create({
                    parent_group: center.id,
                    child_group: group.id
                });
        } else
            await MembershipGroup.destroy({child_group: oldCentersMG.map(mg => mg.id)});

        //research domains and interactions
        if (rsData.main_research_domain) {
            await clearResearchDomains([rsData.main_research_domain.code], group, 'main');
            await addResearchDomain(rsData.main_research_domain.code, group, 'main');
        } else
            await clearResearchDomains([], group, 'main');

        await clearResearchDomains(rsData.interactions.map(i => i.code), group, 'interaction');
        for (const ird of rsData.interactions)
            await addResearchDomain(ird.code, group, 'interaction');
    }

    async function clearResearchDomains(correctRdCodes, group, type) {
        let res;
        if (!correctRdCodes.length)
            res = await GroupAttribute.find({
                researchEntity: group.id
            });
        else
            res = await GroupAttribute.find({
                attribute: {
                    '!': researchDomains.filter(rd => correctRdCodes.includes(rd.key)).map(rd => rd.id),
                },
                researchEntity: group.id
            });

        //query language does not support JSON
        const toDeleteIds = res.filter(ga => !ga.extra || ga.extra.type === type).map(ga => ga.id);
        if (toDeleteIds.length)
            await GroupAttribute.destroy({id: toDeleteIds});
    }

    async function addResearchDomain(rdCode, group, type) {
        const rd = researchDomains.find(rd => rd.key === rdCode);
        if (rd) {
            const res = await GroupAttribute.find({attribute: rd.id, researchEntity: group.id});
            if (!res.filter(ga => ga.extra && ga.extra.type === type).length)
                await GroupAttribute.create({attribute: rd.id, researchEntity: group.id, extra: {type}});
        }
    }

    sails.log.info('Group import finished');
}

async function importSourceMetrics(filename) {
    const sourceIdentifiers = SourceMetric.sourceIdentifiers;

    const yearRegex = /^(19|20)\d{2}$/;

    const originCellCoord = 'B1';
    const yearCellCoord = 'D1';

    let recordsCount = 0;

    const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const filePath = 'metrics_import/' + filename;

    const errors = [];

    let workbook;
    let year;

    if (fs.existsSync(filePath)) {
        try {
            workbook = xlsx.readFile(filePath);
        } catch (err) {
            sails.log.info('Source metrics import stopped: Unsupported file!');
        }
        const sheetNameList = workbook.SheetNames;

        const workSheet = workbook.Sheets[sheetNameList[0]];

        if (!workSheet[originCellCoord] || !workSheet[yearCellCoord]) {
            sails.log.info('Source metrics import stopped: Invalid file format!');
        }

        const origin = workSheet[originCellCoord].v;
        if (origin !== 'wos' && origin !== 'scopus') {
            sails.log.info('The origin on cell ' + originCellCoord + ' is not valid!');
        }

        year = workSheet[yearCellCoord].v;
        if (!yearRegex.test(year)) {
            sails.log.info('The year on cell ' + yearCellCoord + ' is not valid!');
        }

        if (errors.length > 0) {
            sails.log.info('Source metrics import stopped: ' + errors.join(', '));
        }

        const columnsMapping = {};

        for (const c of cols) {
            const colNameCell = workSheet[c + '2'];
            if (!colNameCell)
                break;

            columnsMapping[colNameCell.v] = c;
        }

        const keyColumns = Object.keys(columnsMapping).filter(c => sourceIdentifiers.includes(c));
        const valueColumns = Object.keys(columnsMapping).filter(c => !sourceIdentifiers.includes(c));

        let i = 3;
        while (true) {
            const workSheetRow = {};

            for (const colName in columnsMapping) {
                const col = columnsMapping[colName];
                const cellCoord = col + i;
                if (workSheet[cellCoord])
                    workSheetRow[colName] = workSheet[cellCoord].v;
            }

            if (workSheetRow.issn) {
                workSheetRow.issn = workSheetRow.issn + '';
                workSheetRow.issn = workSheetRow.issn.replace(/-/g, '');
            }
            if (workSheetRow.eissn) {
                workSheetRow.eissn = workSheetRow.eissn + '';
                workSheetRow.eissn = workSheetRow.eissn.replace(/-/g, '');
            }

            if (_.isEmpty(workSheetRow))
                break;

            i++;

            const baseRecord = {};

            for (const kc of keyColumns)
                if (workSheetRow[kc])
                    baseRecord[kc] = workSheetRow[kc];

            if (_.isEmpty(baseRecord))
                continue;

            baseRecord.year = year;
            baseRecord.origin = origin;

            for (const vc of valueColumns) {
                if (!workSheetRow[vc])
                    continue;

                const criteria = _.clone(baseRecord);
                criteria.name = vc;
                const record = _.clone(baseRecord);
                record.name = vc;
                record.value = workSheetRow[vc];
                await SourceMetric.createOrUpdate(criteria, record);
                recordsCount++;

                if (recordsCount % 1000 === 0)
                    sails.log.debug('source metrics inserted/updated: ' + recordsCount);
            }
        }
    } else {
        sails.log.info('Source metrics import stopped: File not found!');
    }

    sails.log.info('imported ' + recordsCount + ' records');
}

async function importUserContracts(email = ImportHelper.getDefaultEmail()) {

    const collectGroupCodes = (contract) => {
        const codes = [];
        for (let i = 1; i <= 6; i++) {
            if (!_.isEmpty(contract['linea_' + i])) {
                codes.push(contract['linea_' + i]);
            }
        }
        return codes;
    };

    const startedTime = moment.utc();
    sails.log.info('The import started at ' + startedTime.format());
    sails.log.info('-----------------------------------------------------------------');

    const valueHiddenPrivacy = ImportHelper.getValueHiddenPrivacy();

    // Endpoint options to get all users
    const reqOptionsEmployees = ImportHelper.getEmployeesRequestOptions();

    // We cache the groups, membership groups and default profile.
    const activeGroups = await Group.find({active: true});
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const ldapUsers = await Utils.getActiveDirectoryUsers();
    const groups = await Group.find();
    if (groups.length <= 0) {
        sails.log.info('No groups found...');
    }

    const ignoredRoles = ImportHelper.getIgnoredRoles();

    const updatedResearchEntityDataItems = [];
    const newResearchEntityDataItems = [];
    const upToDateResearchEntityDataItems = [];
    const updatedUsers = [];
    const updatedDisplayNames = [];
    const insertedUsers = [];

    try {
        reqOptionsEmployees.params.email = email;

        // Get all the employees from Pentaho, including the former employees.
        let employees = await ImportHelper.getEmployees(reqOptionsEmployees);

        if (!employees) {
            return;
        }

        employees = employees.filter(e => _.has(e, 'desc_sottoarea') &&
            e.desc_sottoarea !== 'Gov. & Control' &&
            e.contratto_secondario !== 'X' &&
            !ignoredRoles.includes(e.Ruolo_AD)
        );

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
            }
        }

        // Only keep the employees with a contract
        employees = employees.filter(e => _.has(e, 'contract'));

        // Merge the duplicate employees
        employees = ImportHelper.mergeDuplicateEmployees(employees);

        for (const employee of employees) {
            const groupCodesOfContract = collectGroupCodes(employee);

            const groupNamesOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                return _.toLower(groupCode) === _.toLower(group.code)
            })).map(group => group.name);

            const filteredGroups = await Group.find({
                or: groupNamesOfContract.map(name => ({name: name}))
            }).populate('members').populate('administrators');

            let user = await User.findOne({cid: employee.cid});
            if (!user) {
                user = await User.findOne({username: employee.email});
            }

            let contractEndDate = null;

            // Get the contract end date via the contract history
            const contract = _.head(employee.contract);
            if (
                _.has(contract, 'step') &&
                _.has(contract, 'cid')
            ) {
                const handledSteps = ImportHelper.mergeStepsOfContract(contract);

                const handledStepsOfLastFiveYears = ImportHelper.getValidSteps(handledSteps);

                if (handledStepsOfLastFiveYears.length === 0) {
                    return;
                }

                const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

                contractEndDate = ImportHelper.getContractEndDate(hasPermanentContract, handledStepsOfLastFiveYears);
            } else {
                return;
            }

            const userObject = ImportHelper.createUserObject(ldapUsers, user, employee, contractEndDate);

            if (!user) {
                await User.createUserWithoutAuth(userObject);
                // Search user again to populate ResearchEntity after creation
                user = await User.findOne({cid: employee.cid});
                insertedUsers.push(user);
            } else {
                let displayNamesAreChanged = false;
                if (user.display_name !== employee.nome_AD || user.display_surname !== employee.cognome_AD) {
                    displayNamesAreChanged = true;
                }

                await User.update({id: user.id}, userObject);
                user = await User.findOne({id: user.id});

                if (displayNamesAreChanged) {
                    await User.createAliases(user);
                    sails.log.info('The display names are been updated to: ' + user.display_name + ' ' + user.display_surname);
                    updatedDisplayNames.push(user);
                }
                updatedUsers.push(user);
            }

            if (!user) {
                throw new Error('No user!');
            }

            for (let group of filteredGroups) {
                const condition = {
                    user: user.id,
                    group: group.id
                };
                let membership = await Membership.findOne(condition);

                if (!membership) {
                    membership = await Group.addMember(group, user);
                }

                membership.lastsynch = moment.utc().format();
                membership.synchronized = true;
                membership.active = true;

                await Membership.update(condition, membership);
            }

            // Activate the membership if the user is an internal user and the membership is not active
            if (User.isInternalUser(user)) {
                const membership = await Membership.findOne({group: 1, user: user.id});
                if (membership && !membership.active) {
                    await Membership.update({id: membership.id}, {active: true});
                }
            }

            let researchEntityData = await ResearchEntityData.findOne({
                researchEntity: user.researchEntity
            });

            // Create or update researchEntityData record
            if (researchEntityData) {
                if (!_.isEqual(researchEntityData.imported_data, employee)) {
                    const profile = ImportHelper.getProfileObject(researchEntityData, employee, allMembershipGroups, activeGroups);
                    let profileJSONString = JSON.stringify(profile);

                    if (profile.hidden) {
                        // Replace all the current public privacy settings to hidden
                        profileJSONString = profileJSONString.replace(/"privacy":"public"/gm, '"privacy":"' + valueHiddenPrivacy + '"');
                    }

                    researchEntityData = await ResearchEntityData.update(
                        {id: researchEntityData.id},
                        {
                            profile: profileJSONString,
                            imported_data: JSON.stringify(employee)
                        }
                    );
                    updatedResearchEntityDataItems.push(researchEntityData[0]);
                } else {
                    upToDateResearchEntityDataItems.push(researchEntityData);
                }
            } else {
                const profile = ImportHelper.getProfileObject({}, employee, allMembershipGroups, activeGroups);
                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
                    profile: JSON.stringify(profile),
                    imported_data: JSON.stringify(employee)
                });
                newResearchEntityDataItems.push(researchEntityData);
            }

            sails.log.info('-----------------------------------------------------------------');
        }

        // Select all items where lastsync is before started time and synchronized and active is true
        const condition = {
            lastsynch: {'<' : startedTime.format()},
            synchronized: true,
            active: true
        };

        let disabledSynchronizedMemberships = [],
            disabledUsers = [];

        const contractEndDate = moment().subtract(1, 'days').startOf('day').format();

        // If a specific email is used
        if (email !== ImportHelper.getDefaultEmail()) {
            const user = await User.findOne({username: email});

            if (user) {
                // Deactivate all memberships of the selected user that aren't in sync
                disabledSynchronizedMemberships = await Membership.update(_.merge({user: user.id}, condition), {active: false});

                // Deactivate the selected user if it's not in sync
                disabledUsers = await User.update(
                    _.merge({id: user.id}, condition), {active: false, contract_end_date: contractEndDate}
                );
            }
        } else {
            // Deactivate all memberships of users that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(condition, {active: false});

            // Deactivate all users that aren't in sync
            disabledUsers = await User.update(condition, {active: false, contract_end_date: contractEndDate});
        }

        let disabledCollaborations = [];

        if (disabledUsers.length > 0) {
            // Set the membership active to false for the disabled users or user
            disabledCollaborations = await Membership.update({
                synchronized: false,
                user: disabledUsers.map(user => user.id),
                active: true
            }, {active: false});
        }

        const disabledMemberships = disabledSynchronizedMemberships.length + disabledCollaborations.length;

        sails.log.info('Found ' + employees.length + ' employees with a primary contract & valid role!');
        sails.log.info('....................................');

        sails.log.info(insertedUsers.length + ' Users created!');
        if (insertedUsers.length > 0) {
            sails.log.info('Username(s): ' + insertedUsers.map(user => user.username).join(', '));
        }
        sails.log.info('....................................');

        sails.log.info(updatedUsers.length + ' Users updated!');
        if (updatedUsers.length > 0) {
            sails.log.info('Username(s): ' + updatedUsers.map(user => user.username).join(', '));
        }
        sails.log.info('....................................')

        sails.log.info('Updated the display names for ' + updatedDisplayNames.length + ' Users!');
        if (updatedDisplayNames.length > 0) {
            sails.log.info('Username(s): ' + updatedDisplayNames.map(user => user.username).join(', '));
        }
        sails.log.info('....................................');

        sails.log.info(disabledUsers.length + ' Users disabled + changed contract end date!');
        if (disabledUsers.length > 0) {
            sails.log.info('Username(s): ' + disabledUsers.map(user => user.username).join(', '));
        }
        sails.log.info('....................................');

        sails.log.info(disabledMemberships + ' Memberships disabled!');
        if (disabledSynchronizedMemberships.length > 0) {
            await Promise.all(disabledSynchronizedMemberships.map(async membership => {
                let user = await User.findOne({id: membership.user});
                if (user) {
                    return user.username;
                } else {
                    return 'User not found!';
                }
            })).then(usernames => {
                sails.log.info('Email address(es): ' + usernames.join(', '));
            });
        }
        if (disabledCollaborations.length > 0) {
            await Promise.all(disabledCollaborations.map(async membership => {
                let user = await User.findOne({id: membership.user});
                if (user) {
                    return user.username;
                } else {
                    return 'User not found!';
                }
            })).then(usernames => {
                sails.log.info('Email address(es): ' + usernames.join(', '));
            });
        }
        sails.log.info('....................................');

        sails.log.info(updatedResearchEntityDataItems.length + ' ResearchEntityData records updated!');
        if (updatedResearchEntityDataItems.length > 0) {
            await Promise.all(updatedResearchEntityDataItems.map(async item => {
                let user = await User.findOne({researchEntity: item.researchEntity});
                if (user) {
                    return user.username;
                } else {
                    return 'User not found!';
                }
            })).then(usernames => {
                sails.log.info('Email address(es): ' + usernames.join(', '));
            });
        }
        sails.log.info('....................................');

        sails.log.info(newResearchEntityDataItems.length + ' ResearchEntityData records created!');
        if (newResearchEntityDataItems.length > 0) {
            await Promise.all(newResearchEntityDataItems.map(async item => {
                let user = await User.findOne({researchEntity: item.researchEntity});
                if (user) {
                    return user.username;
                } else {
                    return 'User not found!';
                }
            })).then(usernames => {
                sails.log.info('Email address(es): ' + usernames.join(', '));
            });
        }
        sails.log.info('....................................');

        sails.log.info(upToDateResearchEntityDataItems.length + ' ResearchEntityData records are already up-to-date!');
        sails.log.info('....................................');

        sails.log.info('Stopped at ' + moment.utc().format());
    } catch (e) {
        sails.log.info('importUserContracts');
        sails.log.info(e);
    }
}

async function removeExpiredUsers() {
    const fiveYearsAgo = moment().subtract('5', 'years').startOf('day');
    let deletedUsers = await User.destroy({
        contract_end_date: {'<=': fiveYearsAgo.format()}
    });
    deletedUsers = deletedUsers.map(function(user) {
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

// import Projects

async function importProjects() {
    const annualContributionSchema = {
        year: 'year',
        contribution: 'annual_contribution'
    };

    const membersSchema = {
        email: 'email',
        name: 'firstname',
        surname: 'lastname',
        role: obj => obj.flag_pi ? 'pi' : obj.flag_copi ? 'co_pi' : 'member',
        contributionPercentage: 'contribution_percentage',
        contributionObtained: 'contribution_obtained',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };
    const researchLinesSchema = {
        code: 'cdr',
        description:'cdr_description',
        startDate: 'start_date',
        endDate: 'end_date',
        role: obj => obj.flag_pi ? 'pi' : obj.flag_copi ? 'co_pi' : 'member',
        contribution: 'contribution',
        contributionObtained: 'contribution_obtained',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };
    const partnersSchema = {
        description: 'description',
        budget: 'budget',
        contribution: 'contribution',
        "annualContribution": obj => mapObectsArray(
            obj.annual_contribution,
            annualContributionSchema
        )
    };

    const schemas = {
        [ResearchItemTypes.PROJECT_COMPETITIVE]: {
            code: 'sap_code',
            acronym: 'acronym',
            title: 'title',
            abstract: 'abstract',
            type: 'project_type_1',
            type2: 'project_type_2',
            status: 'project_state',
            startDate: 'start_date',
            endDate: 'end_date',
            instituteStartDate: 'iit_start_date',
            instituteEndDate: 'iit_end_date',
            budget: 'total budget',
            contribution: 'contribution',
            instituteBudget: 'iit_total_budget',
            instituteContribution: 'iit_total_contribution',
            instituteRole: 'project_role',
            partnersNumber: 'partners_count',
            url: 'moniit_url',
            partners: obj => mapObectsArray(obj.partners, partnersSchema),
            members: obj => mapObectsArray(obj.members, membersSchema),
            researchLines: obj => mapObectsArray(obj.lines, researchLinesSchema),
            logos: obj => mapObectsArray(obj.logos,
                {
                    name: 'name',
                    description: 'description',
                    image: 'logo'
                })
        },
        [ResearchItemTypes.PROJECT_INDUSTRIAL]: {
            code: 'code',
            acronym: 'acronym',
            title: 'title',
            type: 'project_type',
            payment: 'project_payment',
            category: 'project_category',
            startDate: 'start_date',
            endDate: 'end_date',
            contribution: 'contribution',
            url: 'moniit_url',
            members: obj => mapObectsArray(obj.members, membersSchema),
            researchLines: obj => mapObectsArray(obj.lines, researchLinesSchema)
        }
    }

    await doImport(ResearchItemTypes.PROJECT_COMPETITIVE);
    await doImport(ResearchItemTypes.PROJECT_INDUSTRIAL);

    await autoVerify();

    async function doImport(type) {
        let projects
        const config = sails.config.scientilla.researchItems.external[type];
        const reqOptions = {
            uri: config.url,
            json: true,
            headers: config.headers
        };

        try {
            projects = await request(reqOptions);
        } catch (e) {
            sails.log.debug(e);
        }

        const errors = [];
        let totalItems = 0, created = 0, updated = 0;

        for (const project of projects) {
            totalItems++;
            try {
                const data = {
                    type: type,
                    projectData: mapObject(project, schemas[type])
                };

                const code = data.projectData.code;
                if (!code) {
                    errors.push({
                        success: false,
                        researchItem: data,
                        message: 'Missing required field "code"'
                    });
                    continue;
                }

                const prj = await Project.findOne({code: code, kind: ResearchItemKinds.EXTERNAL});
                if (!prj) {
                    await ResearchItem.createExternal(config.origin, code, data);
                    created++;
                } else if (JSON.stringify(prj.projectData) !== JSON.stringify(data.projectData)) {
                    await ResearchItem.updateExternal(prj.id, data);
                    updated++;
                }
            } catch (e) {
                errors.push(e);
            }

        }

        sails.log.info(`import ${type} completed`);
        sails.log.info(`${totalItems} found`);
        sails.log.info(`external created: ${created}`);
        sails.log.info(`external updated: ${updated}`);
        sails.log.info(`errors: ${errors.length}`);
        errors.forEach(error => sails.log.debug(JSON.stringify(error) + '\n --------------------- \n'));
    }

    function mapObject(obj, schema) {
        return Object.keys(schema)
            .reduce((res, key) => {
                const mapKey = schema[key];

                if (_.isFunction(mapKey)) {
                    res[key] = mapKey(obj);
                    return res;
                }

                if (_.isNil(obj[mapKey]))
                    return res;

                res[key] = obj[mapKey];
                return res;
            }, {});
    }

    function mapObectsArray(arr, schema) {
        if (!Array.isArray(arr))
            return [];
        return arr.map(e => mapObject(e, schema));
    }


    async function autoVerify() {
        const errors = [];
        let newVerify = 0, unverify = 0;
        const externalProjects = await Project.find({kind: ResearchItemKinds.EXTERNAL});

        const institute = await Group.findOne({type: 'Institute'});
        for (const eProject of externalProjects) {
            const verifiedProject = await Project.findOne({
                kind: ResearchItemKinds.VERIFIED,
                code: eProject.code
            })
                .populate('verified');
            let verified = [];
            if (verifiedProject)
                verified = verifiedProject.verified.map(v => v.researchEntity);

            const lines = eProject.researchLines || [];
            const members = (eProject.members || []).filter(m => ['pi', 'co_pi'].includes(m.role));

            //for some reason find({code:array}) doesn't work so i have to do this
            const groups = [];
            for (const code of lines.map(l => l.code)) {
                const foundGroup = await Group.findOne({code: code});
                if (!_.isEmpty(foundGroup))
                    groups.push(foundGroup);
            }
            const users = await User.find({username: members.map(m => m.email)});

            // only getting 1 level of parentGroups
            const parentGroups = await MembershipGroup.find({child_group: groups.map(g => g.id)})
                .populate('parent_group');

            const researchEntitiesId = [
                institute.id,
                ...users.map(u => u.researchEntity),
                ...groups.map(g => g.researchEntity),
                ...parentGroups.map(pg => pg.parent_group.researchEntity)
            ];

            const toVerify = _.difference(researchEntitiesId, verified);
            const toUnverify = _.difference(verified, researchEntitiesId);

            for (const researchEntityId of _.uniq(toVerify))
                try {
                    await Verify.verify(eProject.id, researchEntityId);
                    newVerify++;
                } catch (e) {
                    errors.push(e);
                }

            for (const researchEntityId of _.uniq(toUnverify))
                try {
                    await Verify.unverify(researchEntityId, verifiedProject.id);
                    unverify++;
                } catch (e) {
                    errors.push(e);
                }


        }

        sails.log.info('Autoverify completed');
        sails.log.info(`added ${newVerify} new verifications`);
        sails.log.info(`removed ${unverify} old verifications`);
        if (errors.length) {
            sails.log.debug(`but there were ${errors.length} errors:`);
            sails.log.debug(JSON.stringify(errors[0]));
        }
    }
}