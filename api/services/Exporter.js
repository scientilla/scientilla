/* global DocumentTypes, SourceTypes, ResearchItemTypes */
// Exporter.js - in api/services

const lescape = require('escape-latex');
const _ = require('lodash');

"use strict";

const bibtexDocumentTypes = [];
const bibtexDocumentTypesMap = {}
const bibtexDourceTypesMap = {};
const bibtexEntryFields = {};

module.exports = {
    documentsToCsv,
    documentsToBibtex,
    getBibtex,
    trainingModulesToCsv,
    accomplishmentsToCsv,
    projectsToCsv,
    patentsToCsv,
    agreementsToCsv
};

function formatValue(value) {
    return new Intl.NumberFormat('en-US', {minimumFractionDigits: 2}).format(value);
}

function getDisplayName(user) {
    let name = '',
        surname = '';

    switch (true) {
        case _.has(user, 'displayName') && !_.isEmpty(user.displayName):
            name = user.displayName;
            break;
        case _.has(user, 'name') && !_.isEmpty(user.name):
            name = user.name;
            break;
        default:
            name = '';
            break;
    }

    switch (true) {
        case _.has(user, 'displaySurname') && !_.isEmpty(user.displaySurname):
            surname = user.displaySurname;
            break;
        case _.has(user, 'surname') && !_.isEmpty(user.surname):
            surname = user.surname;
            break;
        default:
            surname = '';
            break;
    }

    return _.trim(name + ' ' + surname);
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

function trainingModulesToCsv(researchItems) {
    const rows = [[
        'Title',
        'Lecturer(s)',
        'Year',
        'Description/Abstract',
        'Lecture type',
        'Single module',
        'General module title',
        'IIT contact person',
        'Institution',
        'PhD course',
        'Hours',
        'Lectures',
        'Area(s)',
        'Location',
        'Delivery'
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.authorsStr);
        row.push(researchItem.year);
        row.push(researchItem.description);
        row.push(researchItem.type.label);
        row.push(researchItem.wholeModule ? 'Yes' : 'No');
        if (!researchItem.wholeModule) {
            row.push(researchItem.generalModuleTitle);
        } else {
            row.push('/');
        }

        row.push(getDisplayName(researchItem.referent));
        if (researchItem.type.key === 'training_module_summer_winter_school_lecture') {
            row.push('/');
            row.push('/');
        } else {
            if (researchItem.otherCourse) {
                row.push('/');
                row.push('Other');
            } else {
                row.push(researchItem.institute.name);
                row.push(researchItem.phdCourse.name);
            }
        }
        row.push(researchItem.hours);
        row.push(researchItem.lectures);
        const researchDomains = JSON.parse(researchItem.researchDomains);
        row.push(researchDomains.join(','));
        row.push(researchItem.location);
        row.push(researchItem.delivery);

        return row;
    }));

    return generateCSV(rows);
}

function accomplishmentsToCsv(researchItems) {
    const rows = [[
        'Title',
        'Authors',
        'Year',
        'Year to',
        'Issuer',
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
        row.push(researchItem.editorshipRole);
        row.push(researchItem.eventType);
        row.push(researchItem.place);
        row.push(researchItem.description);
        row.push(researchItem.type.label);

        return row;
    }));

    return generateCSV(rows);
}

function agreementsToCsv(researchItems) {
    const rows = [[
        'Acronym',
        'Title',
        'Subject',
        'Agreement type',
        'Counterparts',
        'Scientific coordinators',
        'Author string',
        'Start date',
        'End date',
        'Link'
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.acronym);
        row.push(researchItem.title);
        row.push(researchItem.projectData.subject);
        row.push(researchItem.projectType);
        row.push(researchItem.projectData.partners.map(p => p.institute + ' ' + p.department).join(', '));
        row.push(researchItem.projectData.pis.map(pi => pi.surname + ' ' + pi.name).join(', '));
        row.push(researchItem.authorsStr);
        row.push(researchItem.startDate);
        row.push(researchItem.endDate);
        row.push(researchItem.projectData.link);

        return row;
    }));

    return generateCSV(rows);
}

function projectsToCsv(researchItems) {
    // Industrial projects
    const industrialProjects = researchItems.filter(researchItem => researchItem.type.key === ResearchItemTypes.PROJECT_INDUSTRIAL);
    const rowsIndustrial = [[
        'Title',
        'Type',
        'Code',
        'Start date',
        'End date',
        'Category',
        'Payment',
        'Status',
        'Total contribution [EUR]',
        'In cash contribution [EUR]',
        'In kind contribution [EUR]'
    ]].concat(industrialProjects.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.type.label);
        row.push(researchItem.code);
        row.push(researchItem.startDate);
        row.push(researchItem.endDate);
        row.push(researchItem.category);
        row.push(researchItem.payment);
        row.push(researchItem.status);
        row.push(formatValue(researchItem.totalContribution));
        row.push(formatValue(researchItem.inCashContribution));
        row.push(formatValue(researchItem.inKindContribution));

        return row;
    }));

    let csvIndustrial = '';

    rowsIndustrial.forEach(function (rowArray) {
        csvIndustrial += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    // Competitive projects
    const competitiveProjects = researchItems.filter(researchItem => researchItem.type.key === ResearchItemTypes.PROJECT_COMPETITIVE);
    const rowsCompetitive = [[
        'Title',
        'Type',
        'Code',
        'Acronym',
        'Start date',
        'End date',
        'Funding type',
        'Action type',
        'Category',
        'Payment',
        'IIT role',
        'Status',
        'Institute budget [EUR]',
        'Institute funding [EUR]'
    ]].concat(competitiveProjects.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];
        row.push(researchItem.title);
        row.push(researchItem.type.label);
        row.push(researchItem.code);
        row.push(researchItem.acronym);
        row.push(researchItem.startDate);
        row.push(researchItem.endDate);
        row.push(researchItem.projectType);
        row.push(researchItem.projectType2);
        row.push(researchItem.category);
        row.push(researchItem.payment);
        row.push(researchItem.role);
        row.push(researchItem.status);
        row.push(formatValue(researchItem.projectData.instituteBudget));
        row.push(formatValue(researchItem.projectData.instituteContribution));

        return row;
    }));

    let csvCompetitive = '';

    rowsCompetitive.forEach(function (rowArray) {
        csvCompetitive += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });

    const csv = {};
    if (industrialProjects.length > 0) {
        csv[ResearchItemTypes.PROJECT_INDUSTRIAL] = csvIndustrial;
    }

    if (competitiveProjects.length > 0) {
        csv[ResearchItemTypes.PROJECT_COMPETITIVE] = csvCompetitive;
    }

    return csv;
}

function patentsToCsv(researchItems) {
    const rows = [[
        'Title',
        'Docket',
        'Application',
        'Filing date',
        'Priority',
        'Inventors',
        'Assignees',
        'Research lines',
        'Patent',
        'Issue date',
        'Publication number',
        'Publication date',
        'Abandoned expired assigned date',
        'Priority pct expiration date',
        'Espacenet URL',
    ]].concat(researchItems.map(ri => {
        const researchItem = ri.toJSON();
        const row = [];

        row.push(researchItem.patentData.title);
        row.push(researchItem.familyDocket);
        row.push(researchItem.patentData.application);
        row.push(researchItem.patentData.filingDate);
        row.push(researchItem.patentData.priority);
        row.push(researchItem.patentData.inventors.map(i => i.surname + ' ' + i.name).join(', '));
        row.push(researchItem.patentData.assignees.map(a => a.name).join(', '));
        row.push(researchItem.patentData.researchLines.map(rl => rl.name).join(', '));
        row.push(researchItem.patentData.patent);
        row.push(researchItem.patentData.issueDate);
        row.push(researchItem.patentData.publication);
        row.push(researchItem.patentData.publicationDate);
        row.push(researchItem.patentData.abandonedExpiredAssignedDate);
        row.push(researchItem.patentData.priorityPctExpirationDate);
        row.push(researchItem.patentData.espacenetUrl);

        return row;
    }));

    return generateCSV(rows);
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

    return generateCSV(rows);
}


function documentsToBibtex(documents) {

    let bibtex = 'data:text/plain;charset=utf-8,';

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


function generateCSV(rows) {
    let csv = '';
    rows.forEach(function (rowArray) {
        csv += rowArray.map(r => r ? '"' + r.toString().replace(/"/g, '""') + '"' : '""')
            .join(',') + '\r\n';
    });
    return csv;
}
