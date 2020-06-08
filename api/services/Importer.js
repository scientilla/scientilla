/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator */
/* global Membership, MembershipGroup, GroupTypes, ResearchEntityData, Utils */
// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');

const moment = require('moment');
moment.locale('en');

const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const zone = moment.tz.guess();

const defaultEmail = 'all';
const yearRegex = /^(19|20)\d{2}$/;

const valuePublicPrivacy = 'public';
const valueHiddenPrivacy = 'hidden';

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
        sails.log.debug('Importer:getEmployees');
        sails.log.debug(e);
    }
}

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

function createUserObject(ldapUsers = [],  user = {}, employee = {}) {

    let contractEndDate = null;
    const to = moment(employee.data_fine_rapporto, 'YYYY-MM-DD');
    if (!moment('31/12/9999', 'DD/MM/YYYY').isSame(to)) {
        contractEndDate = moment.tz(employee.data_fine_rapporto, 'YYYY-MM-DD', zone).utc().format(ISO8601Format);
    }

    const userObject = {
        cid: employee.cid,
        name: employee.nome,
        surname: employee.cognome,
        jobTitle: employee.Ruolo_AD,
        lastsynch: moment().utc().format(),
        active: true,
        synchronized: true,
        contractEndDate: contractEndDate
    };

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
                sails.log.info('The email address we received from Pentaho is not available in the Active Directory, but the old one does.');
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

    return userObject;
}

function getProfileObject(researchEntityData, contract, allMembershipGroups, allGroups) {
    const profile = ResearchEntityData.setupProfile(researchEntityData);

    profile.hidden = (contract.no_people === 'NO PEOPLE' ? true: false);

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
            const office = contract['UO_' + i];

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
                group.name = codeGroup.name,
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
                    sails.log.info('We are only expecting a center as parent group!');
                }
            }
        } else {
            // If it is not an group, we think it's an administrative contract
            const line = lines.find(line => line.code === code);

            group.type = 'Directorate';
            group.name = line.name,
                group.code = line.code;
            group.privacy = defaultPrivacy;
            group.offices = lines.filter(line => line.code === code).map(line => line.office);
        }

        groups.push(group);
    }

    profile.groups = groups;

    return profile;
}

module.exports = {
    importSources,
    importGroups,
    importSourceMetrics,
    importUserContracts,
    getEmployees,
    getEmployeesRequestOptions,
    createUserObject,
    getProfileObject,
    getIgnoredRoles
};

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
            }
            else
                await PrincipalInvestigator.destroy({group: group.id});
        }
        else
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
        }
        else
            await MembershipGroup.destroy({child_group: oldCentersMG.map(mg => mg.id)});

        //research domains and interactions
        if (rsData.main_research_domain) {
            await clearResearchDomains([rsData.main_research_domain.code], group, 'main');
            await addResearchDomain(rsData.main_research_domain.code, group, 'main');
        }
        else
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
        } catch(err) {
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

async function importUserContracts(email = defaultEmail) {

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

    // Endpoint options to get all users
    const reqOptionsEmployees = getEmployeesRequestOptions();

    // We cache the groups, membership groups and default profile.
    const activeGroups = await Group.find({ active: true });
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');
    const ldapUsers = await Utils.getActiveDirectoryUsers();
    const groups = await Group.find();
    if (groups.length <= 0) {
        sails.log.info('No groups found...');
    }

    const ignoredRoles = getIgnoredRoles();

    const updatedResearchEntityDataItems = [];
    const newResearchEntityDataItems = [];
    const upToDateResearchEntityDataItems = [];
    const updatedUsers = [];
    const updatedDisplayNames = [];
    const insertedUsers = [];

    try {
        reqOptionsEmployees.params.email = email;

        // Get all the employees from Pentaho, including the former employees.
        let employees = await getEmployees(reqOptionsEmployees);
        employees = employees.filter(e => _.has(e, 'desc_sottoarea') &&
            e.desc_sottoarea !== 'Gov. & Control' &&
            e.contratto_secondario !== 'X' &&
            !ignoredRoles.includes(e.Ruolo_AD)
        );

        for (const employee of employees) {
            const groupCodesOfContract = collectGroupCodes(employee);

            const groupNamesOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                return _.toLower(groupCode) === _.toLower(group.code)
            })).map(group => group.name);

            const filteredGroups = await Group.find({
                or: groupNamesOfContract.map(name => ({ name: name }))
            }).populate('members').populate('administrators');

            let user = await User.findOne({ cid: employee.cid });
            if (!user) {
                user = await User.findOne({ username: employee.email });
            }
            const userObject = createUserObject(ldapUsers, user, employee);

            if (!user) {
                await User.createUserWithoutAuth(userObject);
                // Search user again to populate ResearchEntity after creation
                user = await User.findOne({ cid: employee.cid });
                insertedUsers.push(user);
            } else {
                let displayNamesAreChanged = false;
                if (user.displayName !== employee.nome_AD || user.displaySurname !== employee.cognome_AD) {
                    displayNamesAreChanged = true;
                }

                await User.update({ id: user.id }, userObject);
                user = await User.findOne({ id: user.id });

                if (displayNamesAreChanged) {
                    await User.createAliases(user);
                    sails.log.info('The display names are been updated to: ' + user.displayName + ' ' + user.displaySurname);
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
                const membership = await Membership.findOne({ group: 1, user: user.id });
                if (membership && !membership.active) {
                    await Membership.update({ id: membership.id }, { active: true });
                }
            }

            let researchEntityData = await ResearchEntityData.findOne({
                researchEntity: user.researchEntity
            });

            // Create or update researchEntityData record
            if (researchEntityData) {
                if (!_.isEqual(researchEntityData.imported_data, employee)) {
                    const profile = getProfileObject(researchEntityData, employee, allMembershipGroups, activeGroups);
                    let profileJSONString = JSON.stringify(profile);

                    if (profile.hidden) {
                        // Replace all the current public privacy settings to hidden
                        profileJSONString = profileJSONString.replace(/"privacy":"public"/gm, '"privacy":"' + valueHiddenPrivacy + '"');
                    }

                    researchEntityData = await ResearchEntityData.update(
                        { id: researchEntityData.id },
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
                const profile = getProfileObject({}, employee, allMembershipGroups, activeGroups);
                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
                    profile: JSON.stringify(profile),
                    imported_data: JSON.stringify(employee)
                });
                newResearchEntityDataItems.push(researchEntityData);
            }
        }

        // Select all items where lastsync is before started time and synchronized and active is true
        const condition = {
            lastsynch: { '<' : startedTime.format() },
            synchronized: true,
            active: true
        };

        let disabledSynchronizedMemberships,
            disabledUsers;

        // If a specific email is used
        if (email !== defaultEmail) {
            const user = await User.findOne({ username: email });
            const contractEndDate = moment().subtract(1, 'days').endOf('day').format();
            sails.log.info(_.merge({ user: user.id }, condition));

            // Deactivate all memberships of the selected user that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(_.merge({ user: user.id }, condition), { active: false });

            // Deactivate the selected user if it's not in sync
            disabledUsers = await User.update(_.merge({ id: user.id }, condition), { active: false, contractEndDate:  contractEndDate });
        } else {
            // Deactivate all memberships of users that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(condition, { active: false });

            // Deactivate all users that aren't in sync
            disabledUsers = await User.update(condition, { active: false, contractEndDate: contractEndDate });
        }

        // Set the membership active to false for the disabled users or user
        const disabledCollaborations = await Membership.update({
            synchronized: false,
            user: disabledUsers.map(user => user.id),
            active: true
        }, { active: false });

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

        sails.log.info(disabledUsers.length + ' Users disabled!');
        if (disabledUsers.length > 0) {
            sails.log.info('Username(s): ' + disabledUsers.map(user => user.username).join(', '));
        }
        sails.log.info('....................................');

        sails.log.info(disabledMemberships + ' Memberships disabled!');
        if (disabledSynchronizedMemberships.length > 0) {
            await Promise.all(disabledSynchronizedMemberships.map(async membership => {
                let user = await User.findOne({ id: membership.user });
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
                let user = await User.findOne({ id: membership.user });
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
                let user = await User.findOne({ researchEntity: item.researchEntity });
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
                let user = await User.findOne({ researchEntity: item.researchEntity });
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