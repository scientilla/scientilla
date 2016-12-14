// Importer.js - in api/services

"use strict";

const xlsx = require('xlsx');
const _ = require('lodash');
const fs = require('fs');

const startingYear = sails.config.scientilla.mainInstituteImport.startingYear;

module.exports = {
    mainInstituteDocumentsImport: function () {

        //TODO if env == development then skip
        let institute;

        return Group.findOneByName(sails.config.scientilla.institute.name)
            .then(i => {
                institute = i;
                return Importer.importScopusDocuments(institute)
            })
            .then(unused => true);
    },
    importScopusDocuments: function (institute) {

        return scopusYearLoop(startingYear);

        function scopusYearLoop(year) {

            const query = {
                limit: 200,
                skip: 0,
                where: {
                    connector: 'Scopus',
                    field: 'scopusId',
                    additionalFields: [
                        {
                            field: 'year',
                            value: year
                        }
                    ]
                }
            };

            sails.log.info('Importing documents from ' + year);

            return scopusLoop(Group, institute.id, query)
                .then(items => next(year))
                .catch(err => {
                    sails.log.debug(err);
                    return next(year);
                });
        }

        function next(year) {
            if (year >= (new Date()).getFullYear() + 1)
                return;

            return scopusYearLoop(year + 1);
        }


        function scopusLoop(researchEntityModel, researchEntityId, query) {

            return Connector.getDocuments(researchEntityModel, researchEntityId, query, true)
                .then(result => {
                    const documents = result.items;
                    Group.createDrafts(Group, institute.id, documents)
                        .then(docs => Group.verifyDrafts(Group, institute.id, docs.map(d => d.id)));

                    if (result.count <= (query.limit + query.skip))
                        return;

                    const newQuery = _.cloneDeep(query);
                    newQuery.skip += query.limit;

                    return scopusLoop(researchEntityModel, researchEntityId, newQuery);
                })
        }

    },

    readSourcesFromExcel: function () {

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
                if (s.type == 'Book Series')
                    s.type = 'bookseries';
                return s;
            };

            const filterJournals = (s) => s.type != 'Trade Journal';

            journalsAndBookSeries = readWorksheet(journalWorksheet, journalMappingsTable, mapJournal, filterJournals);

            const newConferencesWorksheet = workbook.Sheets[sheetNameList[1]];
            const newConferencesMappingsTable = {
                "title": 'B',
                "scopusId": 'A',
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

        return allSourceData;
    }
};