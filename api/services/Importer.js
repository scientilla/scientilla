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
    importGroups
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
    for (let [i, p] of people.entries()) {
        //groups are loaded in memory because waterline doesn't allow case-insensitive queries with postegres
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
            await User.update(criteria, p);
        }
        else {
            user = await User.createCompleteUser(p);
        }

        for (let g of groups) {
            g.members.add(user.id);
            if (p.pi)
                g.administrators.add(user.id);
            await g.savePromise();
        }
    }
    sails.log.info('Import finished');
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