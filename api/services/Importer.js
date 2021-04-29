/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator */
/* global MembershipGroup, GroupTypes, ResearchEntityData, ResearchItemTypes, ResearchItem, ResearchItemKinds, Project */
/* global Verify, Membership, MembershipGroup, GroupTypes, ResearchEntityData, Utils, ImportHelper, Patent */
/* global GeneralSettings */

// Importer.js - in api/services

"use strict";

module.exports = {
    importSources,
    importGroups,
    importSourceMetrics,
    importDirectorates,
    importUserContracts,
    removeExpiredUsers,
    importProjects,
    importPatents,
    updateUserProfileGroups,
    analyseUserImport
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
    // Store data in variables:
    const {
        research_domains: researchDomainsData,
        research_structures: researchStructuresData
    } = res;

    // Delete attribute records with category='research_domain' & where the key is not in the researchDomainsData array
    await Attribute.destroy({
        key: {'!': researchDomainsData.map(rd => rd.code)},
        category: 'research_domain'
    });

    // Loop over the research domains
    for (const rdData of researchDomainsData) {
        // Find or create one with key and category
        let researchDomain = await Attribute.findOrCreate({
            key: rdData.code,
            category: 'research_domain'
        });

        // Set the value of the attribute record
        researchDomain = await Attribute.update({id: researchDomain.id}, {value: rdData});

        // Push the domain to the array
        researchDomains.push(researchDomain[0]);
    }

    // Loop over the structures
    for (const rsData of researchStructuresData) {
        // Find or create a group with the code
        const group = await Group.findOrCreate({code: rsData.cdr});

        // Update the group record with the data
        await Group.update({id: group.id}, {
            name: rsData.description,
            type: rsData.type,
            starting_date: rsData.start_date,
            slug: rsData.slug,
            active: true
        });

        // PI
        // Check if the pis property is array and not empty
        if (Array.isArray(rsData.pis) && rsData.pis.length > 0) {
            const pis = await User.find({username: rsData.pis.map(p => p.email)});

            if (pis && pis.length) {

                // Delete all the records in the database table that are not matching the data
                await PrincipalInvestigator.destroy({
                    group: group.id,
                    pi: {'!': pis.map(p => p.id)}
                });

                // Loop over the found users
                for (const pi of pis) {
                    // Find of create a group administrator with the data
                    await GroupAdministrator.findOrCreate({
                        administrator: pi.id,
                        group: group.id
                    });

                    // Find of create a principal investigator with the data
                    await PrincipalInvestigator.findOrCreate({
                        pi: pi.id,
                        group: group.id
                    });
                }
            } else
                // No users found with a matching email address => delete PI record in the database table
                await PrincipalInvestigator.destroy({group: group.id});
        } else
            // No PIs? => delete them in the database table
            await PrincipalInvestigator.destroy({group: group.id});

        // Center
        // Find membership group records of group as child group and populate parent group
        const membershipGroups = await MembershipGroup.find({child_group: group.id}).populate('parent_group');
        // Get the membership group records of the centers
        const oldCentersMG = membershipGroups.filter(mg => mg.parent_group.type === GroupTypes.CENTER);

        // Check if structure has center and center code
        if (rsData.center && rsData.center.code) {
            // Find or create a group with center code
            const center = await Group.findOrCreate({code: rsData.center.code});
            // Update the group with center data
            await Group.update({id: center.id}, {
                name: rsData.center.name,
                type: GroupTypes.CENTER,
            });

            // Collect the ids of the membership group records of the centers where the parent group
            // is not equal to the center
            const toDeleteIds = oldCentersMG.filter(mg => mg.parent_group.id !== center.id).map(mg => mg.id);
            if (toDeleteIds.length > 0)
                // Delete them
                await MembershipGroup.destroy({id: toDeleteIds});

            // Check if we find a record where the parent group is equal to the center
            if (!oldCentersMG.find(mg => mg.parent_group.id === center.id)) {
                // If not, we create a record
                const membershipGroup = await MembershipGroup.findOrCreate({
                    parent_group: center.id,
                    child_group: group.id
                });

                await MembershipGroup.update({id: membershipGroup.id}, {
                    active: true
                });
            }

            // Create membership group between center and main institute
            const membershipGroup = await MembershipGroup.findOrCreate({
                parent_group: 1,
                child_group: center.id
            });

            await MembershipGroup.update({id: membershipGroup.id}, {
                active: true
            });
        } else
            // If the structure has no center: delete
            await MembershipGroup.destroy({child_group: oldCentersMG.map(mg => mg.id)});

        // Research domains and interactions
        // If structure data has main research domain
        if (rsData.main_research_domain) {
            // Clear the research domains of type 'main'
            await clearResearchDomains([rsData.main_research_domain.code], group, 'main');
            // Add research domain
            await addResearchDomain(rsData.main_research_domain.code, group, 'main');
        } else
            // Clear the research domains
            await clearResearchDomains([], group, 'main');

        // Clear the research domains of type 'interaction'
        await clearResearchDomains(rsData.interactions.map(i => i.code), group, 'interaction');
        // Loop over structure interactions
        for (const ird of rsData.interactions)
            // Add research domain of type 'interaction'
            await addResearchDomain(ird.code, group, 'interaction');
    }

    async function clearResearchDomains(correctRdCodes, group, type) {
        let res;
        if (!correctRdCodes.length)
            // If array is empty find group attributes by group
            res = await GroupAttribute.find({
                researchEntity: group.id
            });
        else
            // If correctRdCodes is not empty, find the group attributes by attribute is not in array
            // and research entity group
            res = await GroupAttribute.find({
                attribute: {
                    '!': researchDomains.filter(rd => correctRdCodes.includes(rd.key)).map(rd => rd.id),
                },
                researchEntity: group.id
            });

        //query language does not support JSON
        // Filter the ids from array where extra property is not existing or extra type is type
        const toDeleteIds = res.filter(ga => !ga.extra || ga.extra.type === type).map(ga => ga.id);
        if (toDeleteIds.length)
            await GroupAttribute.destroy({id: toDeleteIds});
    }

    // Function to add research domain
    async function addResearchDomain(rdCode, group, type) {
        // Search for research domain in array by code
        const rd = researchDomains.find(rd => rd.key === rdCode);

        // If found
        if (rd) {
            // Find group attribute with data
            const res = await GroupAttribute.find({attribute: rd.id, researchEntity: group.id});

            // Filter result where type of extra is type
            if (!res.filter(ga => ga.extra && ga.extra.type === type).length)
                // If not found, create group attribute with data
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

async function importDirectorates() {

    const groups = await Group.find();
    if (groups.length <= 0) {
        sails.log.info('No groups found...');
    }

    // Get all the employees from Pentaho.
    const options = ImportHelper.getUserImportRequestOptions('employees');
    let employees = await ImportHelper.getEmployees(options);

    if (!employees) {
        return;
    }

    employees = ImportHelper.filterEmployees(employees);

    await ImportHelper.importDirectorates(employees, groups);
}

async function analyseUserImport() {
    let roleAssociations = await GeneralSettings.findOne({name: 'role-associations'});
    const ignoredRoles = ImportHelper.getIgnoredRoles();
    const govAndControl = 'Gov. & Control';

    try {
        const options = ImportHelper.getUserImportRequestOptions('employees');

        let employees = await ImportHelper.getEmployees(options);

        if (!employees) {
            return;
        }

        sails.log.info(`Received contracts: ${employees.length}`);
        sails.log.info('************************************************');

        const contractsWithoutSubArea = employees.filter(c => !_.has(c, 'desc_sottoarea') || _.isEmpty(c.desc_sottoarea)).map(c => sails.log.debug(c));
        sails.log.info(`Contracts without sub area: ${contractsWithoutSubArea.length}`);
        sails.log.info('************************************************');

        const contractsWihoutLines = employees.filter(c => (!_.has(c, 'linea_1') || _.isEmpty(c.linea_1)) && c.desc_sottoarea !== govAndControl);
        sails.log.info(`Contracts without lines: ${contractsWihoutLines.length}`);
        /*        for (const c of contractsWihoutLines) {
                    sails.log.debug(c.desc_sottoarea);
                }*/
        sails.log.info('************************************************');

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
        sails.log.info('************************************************');

        const contractsWithoutEmail = employees.filter(c => _.isEmpty(c.email));
        //employees = employees.filter(c => !_.isEmpty(c.email));
        sails.log.info(`Contracts without email: ${contractsWithoutEmail.length}`);
        for (const c of contractsWithoutEmail) {
            sails.log.info(`Name: ${c.nome} Surname:${c.cognome}`);
        }
        sails.log.info('************************************************');

        sails.log.info(`Contracts with email: ${employees.length}`);
        sails.log.info('************************************************');

        const contractsWithoutRuolo1 = employees.filter(c => !_.has(c, 'Ruolo_1') || _.isEmpty(c.Ruolo_1));
        sails.log.info(`Contracts without Ruolo_1: ${contractsWithoutRuolo1.length}`);
        sails.log.info('************************************************');

        const groupedRoles = _.chain(employees)
            .groupBy(e => e.Ruolo_1)
            .map((value, key) => ({role: key, employees: value}))
            .value();

        const totalEmployees = groupedRoles.reduce(function (accumulator, groupedRole) {
            return accumulator + groupedRole.employees.length;
        }, 0);
        sails.log.info(`Total found employees: ${totalEmployees}`);
        sails.log.info('************************************************');

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
        sails.log.info('************************************************');

        const totalEmployees2 = roleAssociations.reduce(function (accumulator, roleAssociation) {
            return accumulator + roleAssociation.employees.length;
        }, 0);
        sails.log.info(`Total employees connected to a associated role: ${totalEmployees2}`);
        sails.log.info('************************************************');

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

async function importUserContracts(email = ImportHelper.getDefaultEmail(), override = false) {

    const startedTime = moment.utc();
    sails.log.info('The import started at ' + startedTime.format());
    sails.log.info('-----------------------------------------------------------------');

    const defaultCompany = ImportHelper.getDefaultCompany();
    const valueHiddenPrivacy = ImportHelper.getValueHiddenPrivacy();

    // We cache the groups, membership groups and default profile.
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const ldapUsers = await Utils.getActiveDirectoryUsers();
    const groups = await Group.find();
    if (groups.length <= 0) {
        sails.log.info('No groups found...');
    }

    const activeGroups = groups.filter(g => g.active === true);

    let cidAssociations = await GeneralSettings.findOne({ name: 'cid-associations' });
    if (_.has(cidAssociations, 'data')) {
        cidAssociations = cidAssociations.data;
    } else {
        cidAssociations = [];
    }

    const updatedResearchEntityDataItems = [];
    const newResearchEntityDataItems = [];
    const upToDateResearchEntityDataItems = [];
    const updatedUsers = [];
    const updatedDisplayNames = [];
    const insertedUsers = [];
    const notActiveUsers = [];

    try {
        // Endpoint options to get all users
        const options = ImportHelper.getUserImportRequestOptions('employees', {email});

        // Get all the employees from Pentaho.
        let employees = await ImportHelper.getEmployees(options);

        if (!employees) {
            return;
        }

        employees = ImportHelper.filterEmployees(employees);

        let foundAssociations = false;
        for (const cidAssociation of cidAssociations) {
            const employee = employees.find(e => e.email === cidAssociation.email)

            if (employee) {
                employee.cid = cidAssociation.cid;
                foundAssociations = true;
                sails.log.debug(`Found CID association for user ${employee.email}: ${employee.cid}`);
            }
        }

        if (foundAssociations) {
            sails.log.info('....................................');
        }

        // Not active employees
        const notActiveEmployees = employees.filter(e => _.has(e, 'stato_dip') && e.stato_dip === 'cessato');

        for (const employee of notActiveEmployees) {
            const user = await ImportHelper.findEmployeeUser(employee);

            if (user) {
                if (_.has(employee, 'data_fine_validita')) {
                    let contractEndDate = null;

                    const date = moment(employee.data_fine_validita, ImportHelper.getISO8601Format());

                    if (date.isValid() && date.isBefore('9999-01-01')) {
                        contractEndDate = date;
                    }
                    user.contract_end_date = contractEndDate;
                }
                notActiveUsers.push(user);
            }
        }

        // Only use the employees without stato_dip === 'cessato'
        employees = employees.filter(e => _.has(e, 'stato_dip') && e.stato_dip !== 'cessato');

        // Get all CID codes in one Array
        const cidCodes = employees.map(employee => employee.cid);
        sails.log.info('Found ' + cidCodes.length + ' CID codes!');

        // Get the contractual history of the CID codes
        const contracts = await ImportHelper.getContractualHistoryOfCidCodes(cidCodes);

        if (contracts.length === 0) {
            return;
        }

        for (const contract of contracts) {
            if (contract.contratto_secondario !== 'X') {
                const employee = employees.find(e => e.cid === contract.cid);
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

        // Only keep the employees with a contract
        employees = employees.filter(e => _.has(e, 'contract'));

        // Merge the duplicate employees
        employees = ImportHelper.mergeDuplicateEmployees(employees);

        for (const employee of employees) {
            const groupCodesOfContract = ImportHelper.collectGroupCodes(employee);

            // Get the groups of the contract
            const groupsOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                return _.toLower(groupCode) === _.toLower(group.code)
            }));

            let user = await User.findOne({cid: employee.cid});
            if (!user) {
                sails.log.debug(`Try to find ${employee.email}`);
                user = await User.findOne({username: employee.email});
            }

            let contractEndDate = null;
            let handledSteps = [];
            const contract = _.head(employee.contract);

            // Skip employee if the contract has no step or cid
            if (!_.has(contract, 'step') || !_.has(contract, 'cid')) {
                continue;
            }

            handledSteps = ImportHelper.mergeStepsOfContract(contract);

            const handledStepsOfLastFiveYears = ImportHelper.getValidSteps(handledSteps);

            if (handledStepsOfLastFiveYears.length === 0) {
                // Skip employee: does not have a contract last 5 years
                continue;
            }

            const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

            contractEndDate = ImportHelper.getContractEndDate(hasPermanentContract, handledStepsOfLastFiveYears);

            const userObject = ImportHelper.createUserObject(ldapUsers, user, employee, contractEndDate);

            if (!user) {
                await User.createUserWithoutAuth(userObject);
                // Search user again to populate ResearchEntity after creation
                user = await User.findOne({cid: employee.cid});
                insertedUsers.push(user);
            } else {
                let displayNamesAreChanged = false;
                if (user.displayName !== employee.nome_AD || user.displaySurname !== employee.cognome_AD) {
                    displayNamesAreChanged = true;
                }

                await User.update({id: user.id}, userObject);
                user = await User.findOne({id: user.id});

                if (displayNamesAreChanged) {
                    await User.createAliases(user);
                    updatedDisplayNames.push(user);
                }
                updatedUsers.push(user);
            }

            if (!user) {
                sails.log.error('No user!');
                continue;
            }

            for (let group of groupsOfContract) {
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

            // We add some default values for the profile.
            for (const [key, handledStep] of Object.entries(handledSteps)) {
                handledStep.privacy = valueHiddenPrivacy;
                handledStep.company = defaultCompany;
                handledSteps[key] = handledStep;
            }

            // Create or update researchEntityData record
            if (researchEntityData) {
                if (!_.isEqual(researchEntityData.imported_data, employee) || override) {
                    const profile = ImportHelper.getProfileObject(researchEntityData, employee, allMembershipGroups, activeGroups);

                    if (!profile) {
                        sails.log.error('No profile!');
                        continue;
                    }

                    profile.experiencesInternal = handledSteps;

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
                const importedData = _.cloneDeep(employee);
                delete importedData.contract;

                const profile = ImportHelper.getProfileObject({imported_data: importedData}, employee, allMembershipGroups, activeGroups);

                if (!profile) {
                    sails.log.error('No profile!');
                    continue;
                }

                profile.experiencesInternal = handledSteps;

                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
                    profile: JSON.stringify(profile),
                    imported_data: JSON.stringify(employee)
                });
                newResearchEntityDataItems.push(researchEntityData);
            }

            //sails.log.info('-----------------------------------------------------------------');
        }

        // Select all items where lastsync is before started time and synchronized and active is true
        const condition = {
            lastsynch: {'<': startedTime.format()},
            synchronized: true,
            active: true
        };

        let disabledSynchronizedMemberships = [];

        const contractEndDate = moment().subtract(1, 'days').startOf('day').format();

        // If a specific email is used
        if (email !== ImportHelper.getDefaultEmail()) {
            const user = await User.findOne({username: email});

            if (user) {
                // Deactivate all memberships of the selected user that aren't in sync
                disabledSynchronizedMemberships = await Membership.update(_.merge({user: user.id}, condition), {active: false});
            }
        } else {
            // Deactivate all memberships of users that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(condition, {active: false});
        }

        for (const user of notActiveUsers) {
            const userData = {
                active: false
            };

            user.contract_end_date = moment().format(ImportHelper.getISO8601Format());

            if (user.contract_end_date) {
                userData.contract_end_date = user.contract_end_date;
            }

            await User.update({id: user.id}, userData);
        }

        let disabledCollaborations = [];

        if (notActiveUsers.length > 0) {
            // Set the membership active to false for the disabled users or user
            disabledCollaborations = await Membership.update({
                synchronized: false,
                user: notActiveUsers.map(user => user.id),
                active: true
            }, {active: false});
        }

        const disabledMemberships = disabledSynchronizedMemberships.length + disabledCollaborations.length;

        sails.log.info('Found ' + employees.length + ' employees with a primary contract & valid role!');
        sails.log.info('....................................');

        sails.log.info(insertedUsers.length + ' Users created!');
        sails.log.info('....................................');

        sails.log.info(updatedUsers.length + ' Users updated!');
        sails.log.info('....................................')

        sails.log.info('Updated the display names for ' + updatedDisplayNames.length + ' Users!');
        sails.log.info('....................................');

        sails.log.info(notActiveUsers.length + ' Users disabled + changed contract end date!');
        sails.log.info('....................................');

        sails.log.info(disabledMemberships + ' Memberships disabled!');
        sails.log.info('....................................');

        sails.log.info(updatedResearchEntityDataItems.length + ' ResearchEntityData records updated!');
        sails.log.info('....................................');

        sails.log.info(newResearchEntityDataItems.length + ' ResearchEntityData records created!');
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
        description: 'cdr_description',
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
            url: 'project_url',
            internalUrl: 'moniit_url',
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
            url: 'project_url',
            members: obj => mapObectsArray(obj.members, membersSchema),
            researchLines: obj => mapObectsArray(obj.lines, researchLinesSchema)
        }
    }

    await doImport(ResearchItemTypes.PROJECT_COMPETITIVE);
    await doImport(ResearchItemTypes.PROJECT_INDUSTRIAL);

    await projectAutoVerify();

    async function doImport(type) {
        let projects
        const config = sails.config.scientilla.researchItems.external[type];
        const reqOptions = config.request;

        try {
            projects = await Utils.waitForSuccesfulRequest(reqOptions);
        } catch (e) {
            sails.log.debug(e);
        }

        const errors = [];
        let totalItems = 0, internalProjects = 0, created = 0, updated = 0;

        for (const project of projects) {
            totalItems++;

            if (project.projectType2 === 'INTERNAL') {
                internalProjects++;
                continue;
            }

            try {
                const projectData = mapObject(project, schemas[type]);

                let startYear = null;
                let endYear = null;

                if (_.has(projectData, 'startDate') && typeof projectData.startDate === 'string') {
                    startYear = projectData.startDate.slice(0, projectData.startDate.indexOf('-'));
                }

                if (_.has(projectData, 'endDate') && typeof projectData.endDate === 'string') {
                    endYear = projectData.endDate.slice(0, projectData.endDate.indexOf('-'));
                }

                const pis = projectData.members.filter(member => ['pi', 'co_pi'].includes(member.role));

                const data = {
                    type: type,
                    startYear: startYear,
                    endYear: endYear,
                    authorsStr: await ResearchItem.generateAuthorsStr(pis),
                    projectData: projectData
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

                const authorsData = pis.map((pi, pos) => ({
                    affiliations: pi.email.includes('@iit.it') ? [1] : [],
                    position: pos
                }));

                const prj = await Project.findOne({code: code, kind: ResearchItemKinds.EXTERNAL});
                if (!prj) {
                    await ResearchItem.createExternal(config.origin, code, data, authorsData);
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
        sails.log.info(`${internalProjects} internal projects`);
        sails.log.info(`external created: ${created}`);
        sails.log.info(`external updated: ${updated}`);
        sails.log.info(`errors: ${errors.length}`);
        errors.forEach(error => sails.log.debug(JSON.stringify(error) + '\n --------------------- \n'));
    }

    async function projectAutoVerify() {
        let errors = [];
        let newVerify = 0, unverified = 0;
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
                    unverified++;
                } catch (e) {
                    errors.push(e);
                }

            const res = await autoVerify(eProject, verifiedProject, toVerify, toUnverify);

            errors = errors.concat(res.errors);
            unverified += res.unverified;
            newVerify += newVerify;

        }

        sails.log.info('Autoverify completed');
        sails.log.info(`added ${newVerify} new verifications`);
        sails.log.info(`removed ${unverified} old verifications`);
        if (errors.length) {
            sails.log.debug(`but there were ${errors.length} errors:`);
            sails.log.debug(JSON.stringify(errors[0]));
        }
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

// import Patents

async function importPatents() {

    function patentDateFormat(date) {
        if (_.isEmpty(date) || date === 'null')
            return null;

        const arr = date.split('-');
        return [arr[2], arr[0], arr[1]].join('-');
    }

    function getAuthorsData(inventors) {
        const authorsData = [];

        for (const [position, inventor] of inventors.entries()) {
            const affiliations = [];
            if (inventor.email.includes('@iit'))
                affiliations.push(1);

            const authorStrs = User.generateAliasesStr(inventor.name, inventor.surname);
            authorsData.push({
                position,
                affiliations,
                authorStr: authorStrs.length > 0 ? authorStrs[0] : ''
            });
        }

        return authorsData;
    }

    const patentSchema = {
        id: 'id',
        application: 'application',
        filingDate: obj => patentDateFormat(obj.filing_date),
        publication: 'publication',
        publicationDate: obj => patentDateFormat(obj.publication_date),
        patent: 'patent',
        title: 'title',
        note: 'note',
        issueDate: obj => patentDateFormat(obj.issue_date),
        abandonedExpiredAssignedDate: obj => patentDateFormat(obj.abandoned_expired_assigned_date),
        priorityPctExpirationDate: obj => patentDateFormat(obj.priority_pct_expiration_date),
        attorney: 'attorney',
        priority: 'priority',
        italian: 'italian',
        statuses: obj => mapObectsArray(obj.statuses, {
            code: 'code',
            description: 'description',
            attachedAt: obj => patentDateFormat(obj.attached_at)
        }),
        inventors: obj => mapObectsArray(obj.inventors, {
            name: 'name',
            surname: 'surname',
            email: 'email',
            alias: 'alias',
            assignee: obj => mapObject(obj.assignee, {
                sign: 'sign',
                name: 'name'
            })
        }),
        researchLines: obj => mapObectsArray(obj.research_lines, {
            code: 'code',
            name: 'name'
        }),
        researchPrograms: obj => mapObectsArray(obj.research_program, {
            code: 'code',
            name: 'name'
        }),
        researchDomain: obj => mapObectsArray(obj.research_domain, {
            code: 'code',
            name: 'name'
        }),
        examiners: obj => mapObectsArray(obj.examiners, {
            name: 'name',
            surname: 'surname',
            office: 'office'
        }),
        assignees: obj => mapObectsArray(obj.assignees, {
            sign: 'sign',
            name: 'name'
        }),
        espacenetUrl: 'espacenet_url',
        patsnapUrl: 'patsnap_url'

    }
    const patentFamilySchema = {
        docket: 'docket',
        id: 'id',
        birthDate: obj => patentDateFormat(obj.birth_date),
        deathDate: obj => patentDateFormat(obj.death_date),
        knowledgeshareUrl: 'knowledgeshare_url',
        countries: 'countries'
    }

    let res
    const config = sails.config.scientilla.researchItems.external[ResearchItemTypes.PATENT];
    const reqOptions = config.request;

    try {
        res = await Utils.waitForSuccesfulRequest(reqOptions);
    } catch (e) {
        sails.log.debug(e);
        throw (e);
    }

    const importErrors = [];
    let totalItems = 0, created = 0, updated = 0;

    for (const item of res.result) {
        if (!item.patent_family.docket) {
            importErrors.push({
                success: false,
                researchItem: item,
                message: 'Missing required field "docket"'
            });
            continue;
        }

        for (const patent of item.patent_family.patents) {
            if (_.isEmpty(patent.statuses))
                continue;

            totalItems++;

            try {
                const authorsData = getAuthorsData(patent.inventors);
                const authorsStr = authorsData.map(ad => ad.authorStr).join(', ');

                const patentFamilyData = mapObject(item.patent_family, patentFamilySchema);
                const patentData = mapObject(patent, patentSchema);

                if (!patentData.application) {
                    importErrors.push({
                        success: false,
                        researchItem: patent,
                        message: 'Missing required field "application"'
                    });
                    continue;
                }

                const code = patentData.id;

                const data = {
                    type: ResearchItemTypes.PATENT,
                    authorsStr,
                    code,
                    patentFamilyData,
                    patentData,
                };

                const pat = await Patent.findOne({code: code, kind: ResearchItemKinds.EXTERNAL});
                if (!pat) {
                    await ResearchItem.createExternal(config.origin, code, data, authorsData);
                    created++;
                } else if (
                    JSON.stringify(pat.patentFamilyData) !== JSON.stringify(data.patentFamilyData)
                    || JSON.stringify(pat.patentData) !== JSON.stringify(data.patentData)
                ) {
                    await ResearchItem.updateExternal(pat.id, data, authorsData);
                    updated++;
                }

            } catch (e) {
                importErrors.push(e);
            }

        }
    }

    sails.log.info(`import ${ResearchItemTypes.PATENT} completed`);
    sails.log.info(`${totalItems} found`);
    sails.log.info(`external created: ${created}`);
    sails.log.info(`external updated: ${updated}`);
    sails.log.info(`errors: ${importErrors.length}`);
    importErrors.forEach(error => sails.log.debug(JSON.stringify(error) + '\n --------------------- \n'));


    let verifyErrors = [];
    let newVerify = 0, unverified = 0;
    const externalPatents = await Patent.find({kind: ResearchItemKinds.EXTERNAL});

    const institute = await Group.findOne({type: 'Institute'});
    for (const ePatent of externalPatents) {
        const verifiedPatent = await Patent.findOne({
            kind: ResearchItemKinds.VERIFIED,
            code: ePatent.code
        }).populate('verified');
        let verified = [];
        if (verifiedPatent)
            verified = verifiedPatent.verified.map(v => v.researchEntity);

        const lines = ePatent.patentData.researchLines || [];

        //for some reason find({code:array}) doesn't work so i have to do this
        const groups = [];
        for (const code of lines.map(l => l.code)) {
            const foundGroup = await Group.findOne({code: code});
            if (!_.isEmpty(foundGroup))
                groups.push(foundGroup);
        }

        // only getting 1 level of parentGroups
        const parentGroups = await MembershipGroup.find({child_group: groups.map(g => g.id)})
            .populate('parent_group');

        const users = await User.find({username: ePatent.patentData.inventors.map(m => m.email)});

        const researchEntitiesId = [
            institute.id,
            ...groups.map(g => g.researchEntity),
            ...users.map(u => u.researchEntity),
            ...parentGroups.map(pg => pg.parent_group.researchEntity)
        ];

        const toVerify = _.difference(researchEntitiesId, verified);
        const toUnverify = _.difference(verified, researchEntitiesId);

        const autoverifyRes = await autoVerify(ePatent, verifiedPatent, toVerify, toUnverify);

        verifyErrors = verifyErrors.concat(autoverifyRes.errors);
        unverified += autoverifyRes.unverified;
        newVerify += autoverifyRes.newVerify;
    }

    sails.log.info('Autoverify completed');
    sails.log.info(`added ${newVerify} new verifications`);
    sails.log.info(`removed ${unverified} old verifications`);
    if (verifyErrors.length) {
        sails.log.debug(`but there were ${verifyErrors.length} errors:`);
        sails.log.debug(JSON.stringify(verifyErrors[0]));
    }

}

async function autoVerify(external, verified, toVerify, toUnverify) {
    const errors = [];
    let newVerify = 0, unverified = 0;
    for (const researchEntityId of _.uniq(toVerify))
        try {
            await Verify.verify(external.id, researchEntityId);
            newVerify++;
        } catch (e) {
            errors.push(e);
        }

    for (const researchEntityId of _.uniq(toUnverify))
        try {
            await Verify.unverify(researchEntityId, verified.id);
            unverified++;
        } catch (e) {
            errors.push(e);
        }

    return {
        errors,
        newVerify,
        unverified
    }
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