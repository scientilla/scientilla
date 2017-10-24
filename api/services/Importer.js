/* global Source, User, Group, SourceMetric, SourceTypes*/
// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');
const request = require('request-promise');
const loadJsonFile = require('load-json-file');


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
    sails.log.info('Import started');
    const url = sails.config.scientilla.mainInstituteImport.userImportUrl;
    const reqOptions = {
        uri: url,
        json: true
    };

    const people = await request(reqOptions);
    sails.log.info(people.length + ' entries found');
    let usersInserted = 0;
    for (let [i, p] of people.entries()) {
        //groups are loaded in memory because waterline doesn't allow case-insensitive queries with postegres
        p.username = _.toLower(p.username);
        const allGroups = await Group.find();
        const groupsToBeInserted = p.groups.filter(g => !allGroups.some(g2 => _.toLower(g2.name) == _.toLower(g)));
        const groupsToSearch = allGroups.filter(g => p.groups.some(g2 => _.toLower(g2) == _.toLower(g.name))).map(g => g.name);
        if (groupsToBeInserted.length) {
            const groupObjs = groupsToBeInserted.map(g => ({name: g}));
            sails.log.info('inserting groups: ' + groupsToBeInserted.join(', '));
            const newGroups = await Group.create(groupObjs);
            const newGroupsName = newGroups.map(g => g.name);
            groupsToSearch.push(...newGroupsName);
        }
        const groupSearchCriteria = {or: groupsToSearch.map(g => ({name: g}))};
        const groups = await Group.find(groupSearchCriteria).populate('members').populate('administrators');
        const criteria = {username: p.username};
        let user = await User.findOne(criteria);
        if (user) {
            if (!user.alreadyAccess)
                await User.update(criteria, p);
        }
        else {
            sails.log.info(`Inserting user ${p.username}`);
            user = await User.createCompleteUser(p);
            usersInserted++;
        }

        for (let g of groups) {
            g.members.add(user.id);
            if (p.pi)
                g.administrators.add(user.id);
            await g.savePromise();
        }
    }
    sails.log.info('Import finished');
    sails.log.info(`${usersInserted} users inserted`);
}

async function importGroups() {
    sails.log.info('Import started');
    const groupsPath = 'data/groups.json';
    const groupNames = await loadJsonFile(groupsPath);
    sails.log.info(groupNames.length + ' entries found');
    for (let groupName of groupNames) {
        const group = await Group.findOneByName(groupName);
        if (group)
            continue;
        await Group.create({name: groupName});
    }
    sails.log.info('Import finished');
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