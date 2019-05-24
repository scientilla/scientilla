/* global DocumentTypes, SourceTypes */
// Exporter.js - in api/services

const lescape = require('escape-latex');
const _ = require('lodash');

"use strict";

module.exports = {
    documentsToCsv,
    documentsToBibtex,
    accomplishmentsToCsv
};


function accomplishmentsToCsv(researchItems) {
    const rows = [[
        'Title',
        'Authors',
        'Year',
        'Year to',
        'Issuer',
        'Source',
        'Editorship role',
        'Event type',
        'Place',
        'Description',
        'Type',
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.authorsStr);
        row.push(researchItem.year);
        row.push(researchItem.yearTo);
        row.push(researchItem.issuer);
        row.push(researchItem.source ? researchItem.source.title : '');
        row.push(researchItem.editorshipRole);
        row.push(researchItem.eventType);
        row.push(researchItem.place);
        row.push(researchItem.description);
        row.push(researchItem.type.label);

        return row;
    }));

    let csv = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    return csv;
}


function documentsToCsv(documents) {
    const rows = [[
        'Authors',
        'Title',
        'Source',
        'Year',
        'DOI',
        'Type',
        'Source type',
        'Citations',
        'IF',
        'SNIP',
        'SJR',
        'Reference'
    ]].concat(documents.map(d => {
        const document = d.toJSON();
        const doc = [];
        doc.push(document.authorsStr);
        doc.push(document.title);

        let source;
        if (document.type === DocumentTypes.INVITED_TALK)
            source = document.itSource;
        else
            source = document.source ? document.source.title : '';

        doc.push(source);
        doc.push(document.year);
        doc.push(document.doi);
        doc.push(document.documenttype ? document.documenttype.label : '');
        doc.push(document.sourceTypeObj ? document.sourceTypeObj.label : '');
        doc.push(Array.isArray(document.scopusCitations) ? document.scopusCitations.reduce((total, s) => total + s.value, 0) : '');
        doc.push(document.IF);
        doc.push(document.SNIP);
        doc.push(document.SJR);

        const reference = [
            document.authorsStr,
            document.title,
            document.sourceDetails,
            document.year,
            document.doi
        ];
        doc.push(reference.filter(r => !_.isNil(r)).join(', '));

        return doc;
    }));

    let csv = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    return csv;
}


function documentsToBibtex(documents) {

    let bibtex = 'data:text/plain;charset=utf-8,';

    documents.forEach(document => {
        bibtex += getBibtex(document) + '\n\n';
    });

    return bibtex;

}

function getBibtex(document) {
    const doc = document.toJSON();

    let entryType = 'ARTICLE';

    if ([
        DocumentTypes.INVITED_TALK,
        DocumentTypes.ABSTRACT_REPORT,
        DocumentTypes.ERRATUM,
        DocumentTypes.POSTER,
        DocumentTypes.PHD_THESIS,
        DocumentTypes.REPORT
    ].includes(doc.documenttype.key)) {
        const map = {
            [DocumentTypes.PHD_THESIS]: 'PHDTHESIS',
            [DocumentTypes.ABSTRACT_REPORT]: 'TECHREPORT',
            [DocumentTypes.ERRATUM]: 'MISC',
            [DocumentTypes.REPORT]: 'MISC',
            [DocumentTypes.POSTER]: 'MISC',
            [DocumentTypes.INVITED_TALK]: 'MISC',
        };
        entryType = map[doc.documenttype.key];
    } else {
        const map = {
            [SourceTypes.JOURNAL]: 'ARTICLE',
            [SourceTypes.CONFERENCE]: 'CONFERENCE',
            [SourceTypes.BOOK]: 'BOOK',
            [SourceTypes.BOOKSERIES]: 'INCOLLECTION',

        };
        entryType = map[doc.source.sourcetype.key];
    }

    const entryFields = {
        'ARTICLE': {
            required: [
                'author',
                'title',
                'journal',
                'year'
            ],
            optional: [
                'volume',
                'number',
                'pages'
            ]
        },
        'CONFERENCE': {
            required: [
                'author',
                'title',
                'booktitle',
                'year'
            ],
            optional: [
                'pages'
            ]
        },
        'BOOK': {
            required: [
                'author',
                'title',
                'publisher',
                'year'
            ],
            optional: [
                'volume'
            ]
        },
        'INCOLLECTION': {
            required: [
                'author',
                'title',
                'booktitle',
                'year'
            ],
            optional: [
                'pages'
            ]
        },
        'PHDTHESIS': {
            required: [
                'author',
                'title',
                'school',
                'year'
            ],
            optional: []
        },
        'TECHREPORT': {
            required: [
                'author',
                'title',
                'institution',
                'year'
            ],
            optional: []
        },
        'MISC': {
            required: [
                'author',
                'title'
            ],
            optional: []
        },
    };

    const fieldsMapper = {
        author: getBibtexAuthors(doc),
        title: doc.title,
        journal: doc.source ? doc.source.title : '',
        booktitle: doc.source ? doc.source.title : '',
        institution: doc.source ? doc.source.title : '',
        publisher: doc.source ? doc.source.title : '',
        school: doc.source ? doc.source.title : '',
        year: doc.year,
        volume: doc.volume,
        number: doc.articleNumber,
        pages: doc.pages,
    };

    const fields = {};

    entryFields[entryType].required.forEach(f => fields[f] = fieldsMapper[f]);
    entryFields[entryType].optional.forEach(f => {
        if (fieldsMapper[f]) fields[f] = fieldsMapper[f];
    });


    return formatBibtex(getBibtexKey(doc), fields, entryType);

}

function getBibtexKey(doc) {
    return 'SCTL-' + doc.id;
}

function getBibtexAuthors(doc) {
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
