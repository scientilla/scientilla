/* global Source, User, Group, SourceMetric, SourceTypes, Attribute, GroupAttribute, PrincipalInvestigator, MembershipGroup, GroupTypes*/
// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');
const moment = require('moment');


module.exports = {
    importSources,
    importPeople,
    importGroups,
    importSourceMetrics
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
        people = await request(reqOptions);
    } catch (e) {
        sails.log.debug('importPeople');
        sails.log.debug(e);
    }
    sails.log.info(people.length + ' entries found');
    const importTime = moment.utc().format();
    let numUsersInserted = 0, numUsersUpdated = 0, numGroupsInserted = 0;
    for (let [i, p] of people.entries()) {
        //groups are loaded in memory because waterline doesn't allow case-insensitive queries with postegres
        p.username = _.toLower(p.username);
        const allGroups = await Group.find();
        const groupsToBeInserted = p.groups.filter(g => !allGroups.some(g2 => _.toLower(g2.name) == _.toLower(g)));
        const groupsToSearch = allGroups.filter(g => p.groups.some(g2 => _.toLower(g2) == _.toLower(g.name))).map(g => g.name);
        if (groupInsertionEnabled && groupsToBeInserted.length) {
            const groupObjs = groupsToBeInserted.map(g => ({name: g}));
            sails.log.info('inserting groups: ' + groupsToBeInserted.join(', '));
            const newGroups = await Group.create(groupObjs);
            numGroupsInserted++;
            const newGroupsName = newGroups.map(g => g.name);
            groupsToSearch.push(...newGroupsName);
        }
        const groupSearchCriteria = {or: groupsToSearch.map(g => ({name: g}))};
        const groups = await Group.find(groupSearchCriteria).populate('members').populate('administrators');
        const criteria = {username: p.username};
        let user = await User.findOne(criteria);
        p.lastsynch = moment().utc().format();
        p.synchronized = true;
        const activeMembership = p.active;
        p.active = true;
        if (user) {
            const u = await User.update(criteria, p);
            if (userShouldBeUpdated(user, p)) {
                sails.log.info(`Updating user ${p.username}`);
                numUsersUpdated++;
            }
        }
        else {
            if (p[usersCreationCondition.attribute] === usersCreationCondition.value) {
                sails.log.info(`Inserting user ${p.username}`);
                user = await User.createCompleteUser(p);
                numUsersInserted++;
            }
        }
        if (!user)
            continue;

        for (let g of groups) {
            g.members.add(user.id);
            await g.savePromise();
            const membershipCriteria = {user: user.id, group: g.id};
            const membership = await Membership.findOne(membershipCriteria);
            if (membership) {
                membership.lastsynch = moment.utc().format();
                membership.synchronized = true;
                membership.active = activeMembership;
                const m = await Membership.update(membershipCriteria, membership);
            }
            if (p.pi) {
                g.administrators.add(user.id);
                await g.savePromise();
            }
        }
    }
    const membershipUpdateCriteria = {lastsynch: {'<': importTime}, synchronized: true, active: true};
    const membershipDisabled = await Membership.update(membershipUpdateCriteria, {active: false});
    const numMembershipDisabled = membershipDisabled.length;
    const userUpdateCriteria = {lastsynch: {'<': importTime}, synchronized: true, active: true};
    const usersDisabled = await User.update(userUpdateCriteria, {active: false});
    const numUsersDisabled = usersDisabled.length;
    sails.log.info('Import finished');
    sails.log.info(`${numUsersInserted} users inserted`);
    sails.log.info(`${numUsersUpdated} users updated`);
    sails.log.info(`${numUsersDisabled} users disabled`);
    sails.log.info(`${numGroupsInserted} groups inserted`);
    sails.log.info(`${numMembershipDisabled} membership disabled`);
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
            starting_date: rsData.start_date
        });

        //PI
        if (Array.isArray(rsData.pis) && rsData.pis.length > 0) {
            const pis = await User.find({username: rsData.pis.map(p => p.email)});

            if (pis && pis.length) {
                await PrincipalInvestigator.destroy({
                    group: group.id,
                    pi: {'!': pis.map(p => p.id)}
                });

                for (const pi of pis)
                    await PrincipalInvestigator.findOrCreate({
                        pi: pi.id,
                        group: group.id
                    });
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
        const toDeleteIds = res.filter(ga => ga.extra.type === type).map(ga => ga.id);
        if (toDeleteIds.length)
            await GroupAttribute.destroy({id: toDeleteIds});
    }

    async function addResearchDomain(rdCode, group, type) {
        const rd = researchDomains.find(rd => rd.key === rdCode);
        if (rd) {
            const res = await GroupAttribute.find({attribute: rd.id, researchEntity: group.id});
            if (!res.filter(ga => ga.extra.type === type).length)
                await GroupAttribute.create({attribute: rd.id, researchEntity: group.id, extra: {type}});
        }
    }

    sails.log.info('Group import finished');
}


async function importSourceMetrics(filename) {
    sails.log.info('Source metrics import started');

    const sourceIdentifiers = SourceMetric.sourceIdentifiers;

    const originCellCoord = 'B1';
    const yearCellCoord = 'D1';

    let recordsCount = 0;

    const cols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const filePath = 'config/init/' + filename;
    if (fs.existsSync(filePath)) {
        const workbook = xlsx.readFile(filePath);
        const sheetNameList = workbook.SheetNames;

        const workSheet = workbook.Sheets[sheetNameList[0]];

        if (!workSheet[originCellCoord] || !workSheet[yearCellCoord])
            throw 'Invalid file format';

        const origin = workSheet[originCellCoord].v;
        const year = workSheet[yearCellCoord].v;

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
            }
        }
    }

    sails.log.info('imported ' + recordsCount + ' records');
    sails.log.info('Source metrics import finished');
}