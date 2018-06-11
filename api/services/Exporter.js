/* global */
// Exporter.js - in api/services

"use strict";

module.exports = {
    documentsToCsv
};


function documentsToCsv(documents) {
    const rows = [[
        'Authors',
        'Ttile',
        'Source',
        'Year',
        'DOI',
        'Type',
        'Source type',
        'Citations',
        'IF',
        'SNIP',
        'SJR'
    ]].concat(documents.map(d => {
        const document = d.toJSON();
        const doc = [];
        doc.push(document.authorsStr);
        doc.push(document.title);
        doc.push(document.source.title);
        doc.push(document.year);
        doc.push(document.doi);
        doc.push(document.documenttype.label);
        doc.push(document.source.sourcetype.label);
        doc.push(Array.isArray(document.scopusCitations) ? document.scopusCitations.map(s => s.year + ':' + s.value).join(' - ') : '');
        doc.push(document.IF);
        doc.push(document.SNIP);
        doc.push(document.SJR);

        return doc;
    }));

    let csv = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    return csv;
}

