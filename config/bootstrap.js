/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
'use strict';
const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');

module.exports.bootstrap = function (cb) {
    // It's very important to trigger this callback method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

    let firstRun = false;

    checkFirstRun()
        .then(initializeInstitutes)
        .then(initializeGroups)
        .then(initializeSources)
        .then(importDocuments)
        .then(_ => cb());

    function checkFirstRun() {
        return Group.count()
            .then(groupsNum => firstRun = !groupsNum);
    }

    function importDocuments() {
        if (!firstRun || !sails.config.scientilla.mainInstituteImport.enabled)
            return;

        sails.log.info('Importing document from scopus ');
        return Importer.mainInstituteDocumentsImport();

    }

    function initializeGroups() {
        if (!firstRun) return;
        const fields = ['name', 'shortname', 'scopusId'];
        const groupData = _.pick(sails.config.scientilla.institute, fields);
        sails.log.info('Creating group ' + groupData.name);
        return Group.create(groupData);
    }

    function initializeInstitutes() {
        if (!firstRun) return;
        const instituteData = sails.config.scientilla.institute;
        sails.log.info('Creating institute ' + instituteData.name);
        return Institute.create(instituteData);
    }

    function initializeSources() {
        if (!firstRun) return;
        const sources = readFromExcel();
        sails.log.info('Inserting ' + sources.length + ' new sources');
        return Source.create(sources);

        function readFromExcel() {

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
                    "scoupusId": 'A',
                    "issn": 'C',
                    "eissn": 'D',
                    "type": 'T',
                    "publisher": 'Z'
                };

                const mapJournal = (s) => {
                    if (s.type == 'Book Series')
                        s.type = 'bookseries';
                    return s;
                };

                const filterJournals = (s) => s.type != 'Trade Journal';

                journalsAndBookSeries = readWorksheet(journalWorksheet, journalMappingsTable, mapJournal, filterJournals);

                const newConferencesWorksheet = workbook.Sheets[sheetNameList[1]];
                const newConferencesMappingsTable = {
                    "title": 'B',
                    "scoupusId": 'A',
                    "issn": 'D'
                };
                const mapConference = s => {
                    s.type = 'conference';
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

            const allSourceData = _.union(journalsAndBookSeries, newConferences, oldConferences, books);

            const sanitazedSourceData = allSourceData.map(s => {
                s.scopusId = '' + s.scopusId;
                return s;
            });
            return sanitazedSourceData;
        }
    }
};
