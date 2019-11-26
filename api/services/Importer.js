/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator, MembershipGroup, GroupTypes*/
// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');

const moment = require('moment');
moment.locale('en');

const defaultEmail = 'all';

module.exports = {
    importSources,
    importPeople,
    importGroups,
    importSourceMetrics,
    importUserContracts
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

async function importPeople() {
    function userShouldBeUpdated(user, values) {
        const userFieldsToUpdate = [
            'jobTitle',
            'name',
            'surname'
        ];
        const toUpdate = userFieldsToUpdate.some(f => values[f] !== user[f]);
        return toUpdate;
    }

    const usersCreationCondition = sails.config.scientilla.mainInstituteImport.usersCreationCondition;
    const groupInsertionEnabled = false;
    sails.log.info('Import started');
    const url = sails.config.scientilla.mainInstituteImport.userImportUrl;
    const reqOptions = {
        uri: url,
        json: true
    };

    let people;
    try {
        // Get all people
        people = await request(reqOptions);
        sails.log.info(people.length + ' entries found');
        // Save start time
        const importTime = moment.utc().format();
        //groups are loaded in memory because waterline doesn't allow case-insensitive queries with postegres
        let allGroups = await Group.find();
        let numUsersInserted = 0, numUsersUpdated = 0, numGroupsInserted = 0;
        // Loop over people
        for (let [i, p] of people.entries()) {
            //Lowercase username
            p.username = _.toLower(p.username);
            // Get a new array of all the group names of the person
            const groupsToSearch = allGroups.filter(g => p.groups.some(g2 => _.toLower(g2) == _.toLower(g.name))).map(g => g.name);
            // can be removed
            if (groupInsertionEnabled) {
                const groupsToBeInserted = p.groups.filter(g => !allGroups.some(g2 => _.toLower(g2.name) == _.toLower(g)));
                if (groupsToBeInserted.length) {
                    const groupObjs = groupsToBeInserted.map(g => ({name: g}));
                    sails.log.info('inserting groups: ' + groupsToBeInserted.join(', '));
                    const newGroups = await Group.create(groupObjs);
                    numGroupsInserted++;
                    const newGroupsName = newGroups.map(g => g.name);
                    groupsToSearch.push(...newGroupsName);
                    allGroups = await Group.find();
                }
            }
            const groupSearchCriteria = {or: groupsToSearch.map(g => ({name: g}))};
            // Find all groups with members and administrators
            const groups = await Group.find(groupSearchCriteria).populate('members').populate('administrators');
            const criteria = {username: p.username};
            // Find user by username
            let user = await User.findOne(criteria);
            // If the user is empty get the user by distingiushed name from the Auth table
            if (!user) {
                const auth = await Auth.findOne({dn: p.dn}).populate('user');
                if (auth) user = auth.user;
            }
            // Set some parameters
            p.lastsynch = moment().utc().format();
            p.synchronized = true;
            // Store current state of active
            const activeMembership = p.active;
            p.active = true;
            // If user is not empty
            if (user) {
                // Update user with data
                const u = await User.update({id: user.id}, p);
                // Check if some specific fields changed
                if (userShouldBeUpdated(user, p)) {
                    sails.log.info(`Updating user ${p.username}`);
                    numUsersUpdated++;
                }
            }
            // If user is empty
            else {
                // If userCreationCondition is false or the user usersCreationCondition attribute is the same as the the config
                if (!usersCreationCondition || p[usersCreationCondition.attribute] === usersCreationCondition.value) {
                    sails.log.info(`Inserting user ${p.username}`);
                    // Create new user
                    user = await User.createCompleteUser(p);
                    numUsersInserted++;
                }
            }

            // If the user is still empty, go to the next person
            if (!user)
                continue;

            // Loop over the groups of the specific person
            for (let g of groups) {
                const membershipCriteria = {user: user.id, group: g.id};
                // Search for a membership where the user and group have the specified id
                let membership = await Membership.findOne(membershipCriteria);
                // if the membership doesn't exsist add the user as member
                if (!membership) {
                    membership = await Group.addMember(g, user);
                }
                // Else update the membership
                if (membership) {
                    membership.lastsynch = moment.utc().format();
                    membership.synchronized = true;
                    membership.active = activeMembership;
                    const m = await Membership.update(membershipCriteria, membership);
                }
            }
            //reenable membership to main group if a user is back
            if (User.isInternalUser(user)) {
                const m = await Membership.findOne({group: 1, user: user.id});
                if (m && !m.active && activeMembership)
                    await Membership.update({id: m.id}, {active: true});
            }
        }
        // Update membership, which membership?
        const membershipUpdateCriteria = {lastsynch: {'<': importTime}, synchronized: true, active: true};
        const membershipDisabled = await Membership.update(membershipUpdateCriteria, {active: false});

        // Update user, which user?
        const userUpdateCriteria = {lastsynch: {'<': importTime}, synchronized: true, active: true};
        const usersDisabled = await User.update(userUpdateCriteria, {active: false});

        // Set the membership active to false for the disabled users
        const collaborationUpdateCriteria = {synchronized: false, user: usersDisabled.map(u => u.id), active: true};
        const collaborationDisabled = await Membership.update(collaborationUpdateCriteria, {active: false});

        const numUsersDisabled = usersDisabled.length;
        const numMembershipDisabled = membershipDisabled.length + collaborationDisabled.length;
        await Membership.update({user: usersDisabled.map(u => u.id), active: true, group: 1}, {active: false});
        sails.log.info('Import finished');
        sails.log.info(`${numUsersInserted} users inserted`);
        sails.log.info(`${numUsersUpdated} users updated`);
        sails.log.info(`${numUsersDisabled} users disabled`);
        sails.log.info(`${numGroupsInserted} groups inserted`);
        sails.log.info(`${numMembershipDisabled} membership disabled`);
    } catch (e) {
        sails.log.error('importPeople error');
        sails.log.error(e);
    }
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
        const yearRegex = /^(19|20)\d{2}$/;
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
    const userIsBeenChanged = (user, values) => {
        const fields = [
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
        uri: sails.config.scientilla.userImport.endpoint,
        qs: {
            rep: 'PROD',
            trans: '/public/scheda_persona_flat',
            output: 'json',
            email: email
        },
        headers: {
            username: sails.config.scientilla.userImport.username,
            password: sails.config.scientilla.userImport.password
        },
        json: true
    };

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
        let res = await request(reqOptions).catch(err => {
            console.log(res.status);
        });
        const responseData = res._.scheda;
        let contracts = [];

        if (email !== defaultEmail) {
            contracts.push(responseData);
        } else {
            contracts = responseData;
        }

        // Get primary contracts of people with a valid email address
        const primaryContractsWithValidEmail = contracts.filter(contract => {
            if (contract.contratto_secondario !== 'X' && /\S+@\S+\.\S+/.test(contract.email)) {
                return true;
            }

            if (contract.contratto_secondario !== 'X' && !/\S+@\S+\.\S+/.test(contract.email)) {
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
                    researchEntityData = await ResearchEntityData.update(
                        { id: researchEntityData.id },
                        { imported_data: JSON.stringify(contract) }
                    );
                    updatedResearchEntityDataItems.push(researchEntityData);
                } else {
                    upToDateResearchEntityDataItems.push(researchEntityData);
                }
            } else {
                researchEntityData = await ResearchEntityData.create({
                    researchEntity: user.researchEntity,
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
        // Deactivate all memberships of users that aren't in sync
        const disabledSynchronizedMemberships = await Membership.update(condition, { active: false });

        // Deactivate all users that aren't in sync
        const disabledUsers = await User.update(condition, { active: false });

        // Set the membership active to false for the disabled users
        const disabledCollaborations = await Membership.update({
            synchronized: false,
            user: disabledUsers.map(user => user.id),
            active: true
        }, { active: false });

        const disabledMemberships = disabledSynchronizedMemberships.length + disabledCollaborations.length;

        sails.log.info(invalidEmails.length + ' invalid email addresses found in the Pentaho response!');
        sails.log.info(primaryContractsWithValidEmail.length + ' primary contracts found with a valid email address!');
        sails.log.info(insertedUsers.length + ' Users created!');
        //if (insertedUsers.length > 0 && insertedUsers.length < 10) {
            sails.log.info(JSON.stringify(insertedUsers));
        //}
        sails.log.info(updatedUsers.length + ' Users updated!');
        //if (info.length > 0 && updatedUsers.length < 10) {
            sails.log.info(JSON.stringify(updatedUsers));
        //}
        sails.log.info(disabledUsers.length + ' Users disabled!');
        //if (disabledUsers.length > 0 && disabledUsers.length < 10) {
            sails.log.info(JSON.stringify(disabledUsers));
        //}
        sails.log.info(disabledMemberships + ' Memberships disabled!');
        //if (disabledMemberships.length > 0 && disabledMemberships.length < 10) {
            sails.log.info(JSON.stringify(disabledSynchronizedMemberships));
            sails.log.info(JSON.stringify(disabledCollaborations));
        //}
        sails.log.info(updatedResearchEntityDataItems.length + ' ResearchEntityData records updated!');
        //if (updatedResearchEntityDataItems.length > 0 && updatedResearchEntityDataItems.length < 10) {
            sails.log.info(JSON.stringify(updatedResearchEntityDataItems));
        //}
        sails.log.info(newResearchEntityDataItems.length + ' ResearchEntityData records created!');
        //if (newResearchEntityDataItems.length > 0 && newResearchEntityDataItems.length < 10) {
            sails.log.info(JSON.stringify(newResearchEntityDataItems));
        //}
        sails.log.info(upToDateResearchEntityDataItems.length + ' ResearchEntityData records are already up-to-date!');
        //if (upToDateResearchEntityDataItems.length > 0 && upToDateResearchEntityDataItems.length < 10) {
            sails.log.info(JSON.stringify(upToDateResearchEntityDataItems));
        //}
        sails.log.info('Stopped at ' +  moment.utc().format());
    } catch (e) {
        sails.log.debug('importUserContracts');
        sails.log.debug(e);
    }
}