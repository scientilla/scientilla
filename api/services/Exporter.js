/* global DocumentTypes, SourceTypes, ResearchItemTypes */
// Exporter.js - in api/services

"use strict";
const lescape = require('escape-latex');
const _ = require('lodash');
const ExcelJS = require('exceljs');

const bibtexDocumentTypes = [];
const bibtexDocumentTypesMap = {}
const bibtexDourceTypesMap = {};
const bibtexEntryFields = {};

module.exports = {
    exportDownload,
    generateCSV,
    generateExcel,
    documentsToBibtex,
    getBibtex
};

function exportDownload(Model, res, ids, format) {
    const data = Model.export(ids, format);
    const options = {};
    if (['csv', 'bibitex'].includes(format))
        options.dataType = 'file';
    else if (format === 'excel')
        options.dataType = 'excel';

    res.halt(data, options);
}

function generateCSV(rows) {
    let csv = '';
    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });
    return csv;
}


async function generateExcel(rawRows, sheetLabels = ['Sheet1']) {
    const sheetsRows = _.cloneDeep(rawRows);
    const workbook = new ExcelJS.Workbook();
    sheetLabels.forEach((sheetLabel, i) => {
        const rows = sheetsRows[i].map(a => a.map(v => v ? v : ''));
        const sheet = workbook.addWorksheet(sheetLabel);
        rows.forEach(row => sheet.addRow(row));
    });

    return await workbook.xlsx.writeBuffer();
}

function bibtexInit() {
    if (!_.isEmpty(bibtexDocumentTypes))
        return;

    bibtexDocumentTypes.push(DocumentTypes.INVITED_TALK);
    bibtexDocumentTypes.push(DocumentTypes.ABSTRACT_REPORT);
    bibtexDocumentTypes.push(DocumentTypes.ERRATUM);
    bibtexDocumentTypes.push(DocumentTypes.POSTER);
    bibtexDocumentTypes.push(DocumentTypes.PHD_THESIS);
    bibtexDocumentTypes.push(DocumentTypes.REPORT);

    bibtexDocumentTypesMap[DocumentTypes.PHD_THESIS] = 'PHDTHESIS';
    bibtexDocumentTypesMap[DocumentTypes.ABSTRACT_REPORT] = 'TECHREPORT';
    bibtexDocumentTypesMap[DocumentTypes.ERRATUM] = 'MISC';
    bibtexDocumentTypesMap[DocumentTypes.REPORT] = 'MISC';
    bibtexDocumentTypesMap[DocumentTypes.POSTER] = 'MISC';
    bibtexDocumentTypesMap[DocumentTypes.INVITED_TALK] = 'MISC';

    bibtexDourceTypesMap[SourceTypes.JOURNAL] = 'ARTICLE';
    bibtexDourceTypesMap[SourceTypes.CONFERENCE] = 'CONFERENCE';
    bibtexDourceTypesMap[SourceTypes.BOOK] = 'BOOK';
    bibtexDourceTypesMap[SourceTypes.BOOKSERIES] = 'INCOLLECTION';

    bibtexEntryFields['ARTICLE'] = {
        required: [
            'author',
            'title',
            'journal',
            'year'
        ],
        optional: [
            'doi',
            'volume',
            'number',
            'pages',
        ]
    };
    bibtexEntryFields['CONFERENCE'] = {
        required: [
            'author',
            'title',
            'booktitle',
            'year'
        ],
        optional: [
            'doi',
            'pages'
        ]
    };
    bibtexEntryFields['BOOK'] = {
        required: [
            'author',
            'title',
            'publisher',
            'year'
        ],
        optional: [
            'doi',
            'volume'
        ]
    };
    bibtexEntryFields['INCOLLECTION'] = {
        required: [
            'author',
            'title',
            'booktitle',
            'year'
        ],
        optional: [
            'doi',
            'pages'
        ]
    };
    bibtexEntryFields['PHDTHESIS'] = {
        required: [
            'author',
            'title',
            'school',
            'year'
        ],
        optional: [
            'doi'
        ]
    };
    bibtexEntryFields['TECHREPORT'] = {
        required: [
            'author',
            'title',
            'institution',
            'year'
        ],
        optional: [
            'doi'
        ]
    };
    bibtexEntryFields['MISC'] = {
        required: [
            'author',
            'title',
            'year'
        ],
        optional: [
            'doi'
        ]
    };
}


function documentsToBibtex(documents) {

    let bibtex = '';

    documents.forEach(document => {
        bibtex += getBibtex(document.toJSON()) + '\n\n';
    });

    return bibtex;

}

function getBibtex(doc) {

    bibtexInit();

    const entryType = bibtexDocumentTypes.includes(doc.documenttype.key) ?
        _.has(doc, 'documenttype.key') && bibtexDocumentTypesMap[doc.documenttype.key] :
        _.has(doc, 'source.sourcetype.key') && bibtexDourceTypesMap[doc.source.sourcetype.key];

    if (!entryType) return;

    const fieldsMapper = {
        author: getBibtexAuthors(doc),
        title: doc.title,
        journal: doc.source ? doc.source.title : '',
        booktitle: doc.source ? doc.source.title : '',
        institution: doc.source ? doc.source.title : '',
        publisher: doc.source ? doc.source.title : '',
        school: doc.source ? doc.source.title : '',
        year: doc.year,
        doi: doc.doi,
        volume: doc.volume,
        number: doc.articleNumber,
        pages: doc.pages,
    };

    const fields = {};
    bibtexEntryFields[entryType].required.forEach(f => fields[f] = fieldsMapper[f]);
    bibtexEntryFields[entryType].optional.forEach(f => {
        if (fieldsMapper[f]) fields[f] = fieldsMapper[f];
    });

    return formatBibtex(getBibtexKey(doc), fields, entryType);
}

function getBibtexKey(doc) {
    return 'SCTL-' + doc.id;
}

function getBibtexAuthors(doc) {
    if (!doc.authorsStr) {
        return;
    }

    const authors = doc.authorsStr.split(', ');

    return authors.map(a => {
        const tokens = a.split(/\s/);

        const {names, surnames} = tokens.reduce((res, val) => {
            if (val.includes('.'))
                res.surnames.push(val.replace(/\./g, '. ').trim());
            else
                res.names.push(val.trim());

            return res;
        }, {names: [], surnames: []});


        return names.join(' ') + ', ' + surnames.join(' ');
    }).join(' and ');
}

function formatBibtex(key, fields, entryType) {
    const fieldsArr = Object.keys(fields).map(f => '  ' + f + '={' + lescape(fields[f]) + '}');
    return '@' + entryType + '{' + key + ',\n' + fieldsArr.join(',\n') + '\n}';
}