/* global DocumentTypes */
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

        return doc;
    }));

    let csv = 'data:text/csv;charset=utf-8,';

    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    return csv;
}

