/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator */
/* global MembershipGroup, GroupTypes, ResearchEntityData */
// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');
const util = require('util');
const axios = require('axios');
const https = require('https');

const moment = require('moment');
moment.locale('en');

const defaultEmail = 'all';
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const yearRegex = /^(19|20)\d{2}$/;
const ISO8601Format = 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]';
const zone = moment.tz.guess();

const valuePublicPrivacy = 'public';
const valueHiddenPrivacy = 'hidden';

const defaultCompany = 'Istituto Italiano di Tecnologia';

module.exports = {
    importSources,
    importGroups,
    importSourceMetrics,
    importUserContracts,
    importUserHistoryContracts,
    removeExpiredUsers
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

async function waitForSuccesfulRequest(options) {
    let attempts = 0;
    const maxAttempts = 5;
    const readFile = util.promisify(fs.readFile);

    options.timeout = 100000;

    const httpsOptions = {};

    if (_.has(sails.config.scientilla.userImport, 'cert')) {
        await readFile(sails.config.scientilla.userImport.cert).then(async (file) => {
            httpsOptions.cert = file;
        });
    }

    if (_.has(sails.config.scientilla.userImport, 'key')) {
        await readFile(sails.config.scientilla.userImport.key).then(async (file) => {
            httpsOptions.key = file;
        });
    }

    if (_.has(sails.config.scientilla.userImport, 'logPerson') && _.has(options, 'headers')) {
        options.headers.log_person = sails.config.scientilla.userImport.logPerson
    }

    const httpsAgent = new https.Agent(httpsOptions);
    options.httpsAgent = httpsAgent;

    async function tryRequest(options) {
        attempts++;

        async function retry(options) {
            if (attempts < maxAttempts) {
                return await tryRequest(options);
            } else {
                return new Error('Too much attempts!');
            }
        }

        return await axios(options).catch(async () => {
            return await retry(options);
        });
    }

    let response = await tryRequest(options);

    if (response && _.has(response, 'status') && response.status === 200) {
        if (attempts > 1) {
            sails.log.info('Reached the API after ' + attempts + ' attempt(s)!');
        }

        if (_.has(response, 'data')) {
            return response.data;
        } else {
            return [];
        }
    }

    sails.log.error('Tried ' + attempts + ' time(s), but failed to reach the API!');
    return [];
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

async function importUserContracts(email = defaultEmail) {
    const userIsBeenChanged = (user, values) => {
        const fields = [
            'roleCategory',
            'jobTitle',
            'name',
            'surname'
        ];
        return fields.some(f => values[f] !== user[f]);
    };

    const collectGroupCodes = (contract) => {
        const codes = [];
        for (let i = 1; i <= 6; i++) {
            if (!_.isEmpty(contract['linea_' + i])) {
                codes.push(contract['linea_' + i]);
            }
        }
        return codes;
    };

    const reqOptions = {
        url: sails.config.scientilla.userImport.endpoint,
        params: {
            rep: 'PROD',
            trans: '/public/scheda_persona_flat',
            output: 'json',
            email: email
        },
        headers: {
            username: sails.config.scientilla.userImport.username,
            password: sails.config.scientilla.userImport.password
        }
    };

    // We cache the groups, membership groups and default profile.
    const allGroups = await Group.find({ active: true });
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');

    const invalidEmails = [];
    const updatedResearchEntityDataItems = [];
    const newResearchEntityDataItems = [];
    const upToDateResearchEntityDataItems = [];
    const updatedUsers = [];
    const insertedUsers = [];

    const importTime = moment.utc().format();

    sails.log.info('Started at ' + importTime);

    try {
        const groups = await Group.find();
        if (groups.length <= 0) {
            sails.log.info('No groups found...');
        }

        let responseData = await waitForSuccesfulRequest(reqOptions);
        if (_.has(responseData, '_.scheda')) {
            responseData = responseData._.scheda;
        } else {
            return;
        }

        if (_.isEmpty(responseData)) {
            return;
        }

        let contracts = [];

        if (email !== defaultEmail) {
            contracts.push(responseData);
        } else {
            contracts = responseData;
        }

        // Get primary contracts of people with a valid email address
        const primaryContractsWithValidEmail = contracts.filter(contract => {
            if (contract.contratto_secondario !== 'X' && emailRegex.test(contract.email)) {
                return true;
            }

            if (contract.contratto_secondario !== 'X' && !emailRegex.test(contract.email)) {
                invalidEmails.push(contract.email);
                return false;
            }

            return false;
        });

        for (const contract of primaryContractsWithValidEmail) {

            const groupCodesOfContract = collectGroupCodes(contract);

            const groupNamesOfContract = groups.filter(group => groupCodesOfContract.some(groupCode => {
                return _.toLower(groupCode) === _.toLower(group.code)
            })).map(group => group.name);

            const filteredGroups = await Group.find({
                or: groupNamesOfContract.map(name => ({ name: name }))
            }).populate('members').populate('administrators');

            let user = await User.findOne({ username: contract.email });

            const userObject = {
                username: contract.email,
                name: contract.nome,
                surname: contract.cognome,
                jobTitle: contract.Ruolo_AD,
                displayName: contract.nome_AD,
                displaySurname: contract.cognome_AD,
                lastsynch: moment().utc().format(),
                active: true,
                synchronized: true,
            };

            if (!user) {
                await User.createUserWithoutAuth(userObject);
                // Search user again to populate ResearchEntity after creation
                user = await User.findOne({ username: contract.email });
                insertedUsers.push(user);
            } else {
                await User.update({ id: user.id }, userObject);

                if (userIsBeenChanged(user, userObject)) {
                    updatedUsers.push(user);
                }
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
                if (!_.isEqual(researchEntityData.imported_data, contract)) {
                    const profile = getProfileObject(researchEntityData, contract, allMembershipGroups, allGroups);
                    let profileJSONString = JSON.stringify(profile);

                    if (profile.hidden) {
                        // Replace all the current public privacy settings to hidden
                        profileJSONString = profileJSONString.replace(/"privacy":"public"/gm, '"privacy":"' + valueHiddenPrivacy + '"');
                    }

                    researchEntityData = await ResearchEntityData.update(
                        { id: researchEntityData.id },
                        {
                            profile: profileJSONString,
                            imported_data: JSON.stringify(contract)
                        }
                    );
                    updatedResearchEntityDataItems.push(researchEntityData[0]);
                } else {
                    upToDateResearchEntityDataItems.push(researchEntityData);
                }
            } else {
                const profile = getProfileObject({}, contract, allMembershipGroups, allGroups);
                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
                    profile: JSON.stringify(profile),
                    imported_data: JSON.stringify(contract)
                });
                newResearchEntityDataItems.push(researchEntityData);
            }
        }

        // Select all items where lastsync is before importTime and synchronized and active is true
        const condition = {
            lastsynch: { '<' : importTime },
            synchronized: true,
            active: true
        };

        let disabledSynchronizedMemberships,
            disabledUsers;

        // If a specific email is used
        if (email !== defaultEmail) {
            const user = await User.findOne({ username: email });

            // Deactivate all memberships of the selected user that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(_.merge({ user: user.id }, condition), { active: false });

            // Deactivate the selected user if it's not in sync
            disabledUsers = await User.update(_.merge({ id: user.id }, condition), { active: false });
        } else {
            // Deactivate all memberships of users that aren't in sync
            disabledSynchronizedMemberships = await Membership.update(condition, { active: false });

            // Deactivate all users that aren't in sync
            disabledUsers = await User.update(condition, { active: false });
        }

        // Set the membership active to false for the disabled users or user
        const disabledCollaborations = await Membership.update({
            synchronized: false,
            user: disabledUsers.map(user => user.id),
            active: true
        }, { active: false });

        const disabledMemberships = disabledSynchronizedMemberships.length + disabledCollaborations.length;

        sails.log.info(invalidEmails.length + ' invalid email addresses found in the Pentaho response for these user(s)!');
        sails.log.info(primaryContractsWithValidEmail.length + ' primary contracts found with a valid email address!');
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

async function importUserHistoryContracts(email = defaultEmail) {

    // Endpoint options to get all users
    const reqOptionsAllEmployees = {
        url: sails.config.scientilla.userImport.endpoint,
        params: {
            rep: 'PROD',
            trans: '/public/scheda_persona_flat',
            output: 'json',
            email: email,
            statodip: 'tutti'
        },
        headers: {
            username: sails.config.scientilla.userImport.username,
            password: sails.config.scientilla.userImport.password
        }
    };

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

    async function getUsers() {
        let users = [];

        const ignoredRoles = [
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

        function isValid(contract) {
            if (
                _.has(contract, 'email') &&
                emailRegex.test(contract.email) &&
                _.has(contract, 'desc_sottoarea') &&
                contract.desc_sottoarea !== 'Gov. & Control' &&
                _.has(contract, 'Ruolo_AD') &&
                ignoredRoles.indexOf(contract.Ruolo_AD) === -1 &&
                _.has(contract, 'cid')
            ) {
                return true;
            }

            return false;
        }

        try {
            let response = await waitForSuccesfulRequest(reqOptionsAllEmployees);

            if (!_.has(response, '_.scheda') || _.isEmpty(response._.scheda)) {
                return false;
            }

            response = response._.scheda;

            if (_.isArray(response)) {
                for (const contract of response) {
                    if (isValid(contract)) {
                        users.push(contract);
                    }
                }
            } else {
                if (isValid(response)) {
                    users.push(response);
                }
            }

            return users;
        } catch (e) {
            sails.log.debug('importUserHistoryContracts:getUsers');
            sails.log.debug(e);
        }
    }

    // This function returns an array of objects with an unique email and matching CID codes.
    function getEmailWithCIDCodes(users) {
        const cards = [];

        // We loop over the items and store only the ones with a valid and unique email address.
        for (const user of users) {
            if (_.has(user, 'email') && emailRegex.test(user.email)) {
                if (_.isUndefined(cards.find(c => c.email === user.email))) {
                    cards.push({
                        email: user.email,
                        cid: [user.cid]
                    });
                } else {
                    const cardIndex = cards.findIndex(c => c.email === user.email);
                    cards[cardIndex].cid.push(user.cid);
                }
            }
        }

        return cards;
    }

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

                    const response = await waitForSuccesfulRequest(reqOptionsContractHistory);

                    handleResponse(response);
                }
            } else {
                reqOptionsContractHistory.params.cid = codes.join(',');

                const response = await waitForSuccesfulRequest(reqOptionsContractHistory);

                handleResponse(response);
            }

            return contracts;

        } catch (e) {
            sails.log.debug('importUserHistoryContracts:getContractualHistoryOfCIDCodes');
            sails.log.debug(e);
        }
    }

    // This function will return false or an object with the groupCode, from (start date), to (end date), role of the
    // membership
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
                    { id: membershipOfGroup.id },
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

    // This function will handle a contract
    // It will loop over each step or step if it's just one and setup the membership
    // Creates the user if the user doesn't exists yet and has a membership of an available group in Scientilla.
    // It also updates the user's profile.
    async function handleHistoryContract(contract, userCard) {

        // Check if the contract has a step and a cid
        if (
            _.has(contract, 'step') &&
            _.has(contract, 'cid')
        ) {
            const steps = contract.step;
            const handledSteps = [];

            sails.log.info('----');

            // Getting the user record of the email address
            let user = await User.findOne({ username: userCard.email });
            sails.log.info('Found user with email address:' + userCard.email);

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

            // Get the expire date of a user from its memberships
            // The expire date will be null for a permanent contract or the youngest end date of a contract.
            let expiresAt = null;
            const hasPermanentContract = !_.isEmpty(handledSteps.filter(handledStep => !_.has(handledStep, 'to')));

            if (!hasPermanentContract) {
                const toDates = handledSteps.filter(handledStep => _.has(handledStep, 'to') && moment(handledStep.to).isValid())
                    .map(handledStep => moment(handledStep.to));

                expiresAt = moment.max(toDates).startOf('day');

                sails.log.info('This user has a contract that will expire or is expired on ' + expiresAt.format());
            } else {
                sails.log.info('This user seems to have a permanent contract!');
            }

            // Set the active state of the user account:
            // It's active when the user has a permanent contract or
            // when the current date if before the expire date of the contract.
            let active = false;
            if (hasPermanentContract || (expiresAt && moment().isBefore(expiresAt))) {
                active = true;
            }

            // When the user does not exist
            if (!user) {

                // We should create a user when the expire date is null
                // or when the expire date is less than five years ago.
                if (
                    expiresAt === null ||
                    (expiresAt !== null && expiresAt.isSameOrAfter(moment().subtract('5', 'years').startOf('day')))
                ) {
                    const userObject = {
                        username: userCard.email,
                        name: userCard.nome,
                        surname: userCard.cognome,
                        jobTitle: userCard.Ruolo_AD,
                        displayName: userCard.nome_AD,
                        displaySurname: userCard.cognome_AD,
                        lastsynch: moment().utc().format(),
                        active: active,
                        synchronized: true
                    };

                    if (expiresAt !== null) {
                        userObject.expiresAt = expiresAt.format();
                    }

                    user = await User.createUserWithoutAuth(userObject);
                    user = await User.findOne({ id: user.id });
                    sails.log.info('New user created with email address: ' + userCard.email);

                    createdUsers.push(user);
                } else {
                    sails.log.info('User stopped working in IIT more than 5 years ago, so it can be skipped!');
                    skippedUsers++;
                    return;
                }
            } else {
                // If the user already exist
                // And the user has a permanent contract
                if (_.isNull(expiresAt)) {
                    // But is not been set into the database, we update the user.
                    if (!_.isNull(user.expiresAt)) {
                        await User.update(
                            { id: user.id },
                            { expiresAt: null }
                        );
                        user = await User.findOne({ id: user.id });
                        sails.log.info('The expiresAt date of the is been removed.');
                        updatedExpiredUsers.push(user);
                    }
                } else {
                    // When the user doesn't have a permanent contract
                    // And the user doesn't have the same expiresAre value we update it.
                    if (_.isNull(user.expiresAt) || !moment(user.expiresAt).isSame(expiresAt)) {
                        await User.update(
                            { id: user.id },
                            { expiresAt: expiresAt.format() }
                        );
                        user = await User.findOne({ id: user.id });
                        sails.log.info('The expiresAt date is been updated to ' + expiresAt.format());
                        updatedExpiredUsers.push(user);
                    }
                }

                if (active !== user.active) {
                    await User.update(
                        { id: user.id },
                        { active: active }
                    );
                    user = await User.findOne({ id: user.id });
                    sails.log.info('The active state is been updated to: ' + active);
                    updatedActiveUsers.push(user);
                }
            }

            // If the we have an user object we go further to create or update the memberships and  profile.
            if (user) {

                // Loop over contract steps and change the active value (former or active member) of the membership
                for (const handledStep of handledSteps) {

                    sails.log.debug(handledStep);

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

                const profile = getProfileObject({}, userCard, allMembershipGroups, allGroups);

                // If we have a researchEntityData record of the user
                if (researchEntityData) {

                    // But the user has no profile
                    if (_.has(researchEntityData, 'profile') && _.isEmpty(researchEntityData.profile)) {
                        // Setup the new profile
                        const profile = getProfileObject({}, userCard, allMembershipGroups, allGroups);

                        profile.experiencesInternal = handledSteps;

                        researchEntityData = await ResearchEntityData.update(
                            { id: researchEntityData.id },
                            { profile: JSON.stringify(profile) }
                        );
                        sails.log.info('We created a profile for the user with the internal experiences.');
                        updatedResearchEntityDataItems.push(researchEntityData);
                    } else {
                        // If the user has a profile, we check if the experiences are equal. If not we update them.
                        if (JSON.stringify(researchEntityData.profile.experiencesInternal) !== JSON.stringify(handledSteps)) {
                            researchEntityData.profile.experiencesInternal = handledSteps;

                            researchEntityData = await ResearchEntityData.update(
                                { id: researchEntityData.id },
                                { profile: JSON.stringify(researchEntityData.profile) }
                            );
                            sails.log.info('The internal experiences are been updated!');
                            updatedResearchEntityDataItems.push(researchEntityData);
                        } else {
                            sails.log.info('The internal experiences are already up-to-date!');
                        }
                    }
                } else {
                    // Setup the new profile
                    const profile = getProfileObject({}, userCard, allMembershipGroups, allGroups);

                    profile.experiencesInternal = handledSteps;

                    researchEntityData = await ResearchEntityData.create({
                        research_entity: user.researchEntity,
                        profile: JSON.stringify(profile),
                        imported_data: JSON.stringify(userCard)
                    });
                    sails.log.info('The user didn\'t have a profile yet, so it\'s been created.');
                    createdResearchEntityDataItems.push(researchEntityData);
                }
            }
        }

        return;
    }

    const startedTime = moment.utc();
    sails.log.info('The import started at ' + startedTime.format());
    sails.log.info('-----------------------------------------------------------------');

    // We cache the groups, membership groups and default profile.
    const allGroups = await Group.find({ active: true });
    const allMembershipGroups = await MembershipGroup.find().populate('parent_group');

    let skippedUsers = 0;
    const updatedMemberships = [];
    const createdMemberships = [];
    const createdUsers = [];
    const updatedExpiredUsers = [];
    const updatedActiveUsers = [];
    const createdResearchEntityDataItems = [];
    const updatedResearchEntityDataItems = [];

    // Get al the users from Pentaho
    sails.log.info('Started to collect user(s) email address(es) and their CID code(s).');
    const allUsers = await getUsers();

    // We continue with the process if we found users
    if (!_.isEmpty(allUsers)) {

        // Filter the users so we have unique email addresses with their CID codes.
        const filteredUsers = getEmailWithCIDCodes(allUsers);

        // Concat all the CID codes into one array.
        const cidCodes = filteredUsers.map(user => user.cid).reduce((accumulator, codes) => accumulator.concat(codes));

        sails.log.info('Found ' + filteredUsers.length + ' user(s) with in total ' + cidCodes.length + ' CID code(s)');

        const userWithMoreThanOneCIDCode = filteredUsers.filter(user => user.cid.length > 1);
        if (userWithMoreThanOneCIDCode.length > 1) {
            sails.log.info('Where ' + userWithMoreThanOneCIDCode.length + ' user(s) have more than one CID code.');
        }

        sails.log.info('----');
        sails.log.info('Started to collect the contractual history of the user(s).');

        // Collect the contracts of the CID codes
        let contracts = await getContractualHistoryOfCIDCodes(cidCodes);

        // Add the contract(s) to correct email address
        for (const contract of contracts) {
            const filteredUserIndex = filteredUsers.findIndex(user => user.cid.includes(contract.cid));
            if (!_.has(filteredUsers[filteredUserIndex], 'contracts')) {
                filteredUsers[filteredUserIndex].contracts = [];
            }

            filteredUsers[filteredUserIndex].contracts.push(contract);
        }

        // Filter contracts of users
        for (const user of filteredUsers) {
            if (!_.has(user, 'contracts') || _.isEmpty(user.contracts)) {
                continue;
            }

            user.contracts = user.contracts.filter(
                contract => _.has(contract, 'contratto_secondario') &&
                    contract.contratto_secondario !== 'X' &&
                    _.has(contract, 'step') &&
                    !_.isEmpty(contract.step)
            );

            const contract = _.head(user.contracts);

            // Check if we have a valid contract
            if (_.isUndefined(contract)) {
                sails.log.info('No valid contract found for user with email: ' + user.email);
            } else {
                const userCard = allUsers.find(u => u.cid === contract.cid);
                await handleHistoryContract(contract, userCard);
            }
        }

        sails.log.info('-----------------------------------------------------------------');

        sails.log.info('Number of created users: ' + createdUsers.length);
        sails.log.info('Number of users that are not been created because of the expireAt date: ' + skippedUsers);
        sails.log.info('Updated the expiredAt date for ' + updatedExpiredUsers.length + ' users');
        sails.log.info('Updated the active state for ' + updatedActiveUsers.length + ' users');
        sails.log.info('Number of created memberships: ' + createdMemberships.length);
        sails.log.info('Number of updated memberships: ' + updatedMemberships.length);
        sails.log.info('Number of created researchEntityData items: ' + createdResearchEntityDataItems.length);
        sails.log.info('Number of updated researchEntityData items: ' + updatedResearchEntityDataItems.length);
    } else {
        sails.log.info('No users found!');
    }

    sails.log.info('-----------------------------------------------------------------');
    const stoppedTime = moment.utc();
    sails.log.info('The import stopped at ' + stoppedTime.format());
    sails.log.info('The duration of the import was done ' + moment.duration(stoppedTime.diff(startedTime)).humanize(true));
}

async function removeExpiredUsers() {
    const fiveYearsAgo = moment().subtract('5', 'years').startOf('day');
    const deletedUsers = await User.destroy({
        expiresAt: {'<=': fiveYearsAgo.format()}
    });
    var deletedUserEmails = deletedUsers.map(function (user) {
        return user.username;
    });
    sails.log.info('Deleted ' + deletedUsers.length + ' users that were expired 5 years ago: ' + fiveYearsAgo.format());
    if (deletedUserEmails.length > 0) {
        if (deletedUserEmails.length === 1) {
            sails.log.info('Deleted the user with email address: ' + deletedUserEmails.join(', '));
        } else {
            sails.log.info('Deleted the users with email address: ' + deletedUserEmails.join(', '));
        }
    }
}