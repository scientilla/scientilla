/* global sails, User, Group, Document, Authorship, Citation, ScopusCitation, DocumentOrigins, SourceTypes */
"use strict";

const _ = require('lodash');
const citation_year_count = 6;
const mainInstituteId = 1;

module.exports = {
    getUserPerformance,
    getUsersPerformance,
    getGroupInstitutePerformance,
    getGroupsInstitutePerformance,
    getUserInstitutePerformance,
    getUsersInstitutePerformance,
};

async function getUserPerformance(user, year) {
    const performance = await getResearchEntityPerformance(user.documents, year);
    return {
        'email': user.username,
        'lastname': user.surname,
        'name': user.name,
        'hindex': performance['hindex'],
        'total_citations': performance['total_citations'],
        'citations_years': performance['citations_years'],
        'source': performance['source'],
    };
}

async function getUsersPerformance(year) {
    const users = await User.find().populate('documents');
    const res = [];
    for (const user of users)
        if (!_.isEmpty(user.documents))
            res.push(await getUserPerformance(user, year));

    return res;
}

async function getGroupInstitutePerformance(group, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const docs = group.documents.filter(d => parseInt(d.year, 10) === y || parseInt(d.year, 10) === y + 1);
    const documents = await Document.find({id: docs.map(d => d.id)}).populate('sourceMetrics');
    const performance = await getResearchEntityInstitutePerformance(documents, y);
    return {
        'cdr': group.cdr,
        'line': group.name,
        'papers': performance['papers'],
        'papers_next_year': performance['papers_next_year'],
        'papers_if': performance['papers_if'],
        'total_if': performance['total_if'],
        'source': '(Publications from SCIENTILLA and Impact Factor from Web of Science)',
    };
}

async function getGroupsInstitutePerformance(year) {
    const groups = await Group.find().populate('documents');
    const res = [];
    for (const group of groups)
        if (!_.isEmpty(group.documents))
            res.push(await getGroupInstitutePerformance(group, year));

    return res;
}


async function getUserInstitutePerformance(user, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const docs = user.documents.filter(d => parseInt(d.year, 10) === y || parseInt(d.year, 10) === y + 1);
    const authorships = await Authorship.find({document: docs.map(d => d.id)}).populate('affiliations');
    const documentIds = authorships.filter(
        a => a.affiliations.map(af => af.id)
            .includes(mainInstituteId))
        .map(a => a.document);
    const documents = await Document.find({id: _.uniq(documentIds)})
        .populate('sourceMetrics');
    const performance = await getResearchEntityInstitutePerformance(documents, y);
    return {
        'email': user.username,
        'lastname': user.surname,
        'name': user.name,
        'papers': performance['papers'],
        'papers_next_year': performance['papers_next_year'],
        'papers_if': performance['papers_if'],
        'total_if': performance['total_if'],
        'source': '(Publications from SCIENTILLA and Impact Factor from Web of Science)',
    };
}

async function getUsersInstitutePerformance(year) {
    const users = await User.find().populate('documents');
    const res = [];
    for (const user of users)
        if (!_.isEmpty(user.documents))
            res.push(await getUserInstitutePerformance(user, year));

    return res;
}


async function getResearchEntityPerformance(docs, year = (new Date()).getFullYear()) {
    const documents = docs.filter(d => d.year <= year);
    const scopusCitations = await getScopusCitations(documents, year);
    const citations = getCitationTotals(scopusCitations);
    const hIndex = calculateHIndex(citations);
    const totalCitations = citations.reduce((total, c) => total + c, 0);

    const years = _.range(citation_year_count, 0).map(i => i + parseInt(year, 10) - citation_year_count);
    const citationsPerYear = (await getCitationPerYear(scopusCitations, years));
    const citationsPerYearStr = citationsPerYear.map(cpy => cpy.year + ':' + cpy.citations).join(', ');

    const lastScopusCitation = await Citation.findOne({origin: DocumentOrigins.SCOPUS}).sort('updatedAt DESC');
    const dataUpTo = lastScopusCitation.updatedAt.getDate() + ' ' +
        lastScopusCitation.updatedAt.getMonth() + ' ' +
        lastScopusCitation.updatedAt.getFullYear();
    return {
        'hindex': 'h-index: ' + hIndex,
        'total_citations': totalCitations,
        'citations_years': 'Nr. of citations per year: ' + citationsPerYearStr,
        'source': '(Citations from Scopus - data up to ' + dataUpTo + ')'
    };
}

async function getResearchEntityInstitutePerformance(documents, year = (new Date()).getFullYear()) {
    const excludedDocumentTypes = [
        DocumentType.ERRATUM,
        DocumentType.POSTER,
        DocumentType.PHD_THESIS,
        DocumentType.REPORT,
        DocumentType.INVITED_TALK,
        DocumentType.ABSTRACT_REPORT
    ];

    const docs = documents.filter(d => !excludedDocumentTypes.includes(d.type));
    const docsCurrentYear = docs.filter(d => parseInt(d.year, 10) === year);
    const docsNextYear = docs.filter(d => parseInt(d.year, 10) === (year + 1));

    const papersStr = 'Nr. of papers in current year (Journal, Conference, Book): ' +
        docsCurrentYear.length +
        ' (' +
        docsCurrentYear.filter(d => d.sourceType === SourceTypes.JOURNAL).length +
        ' J + ' +
        docsCurrentYear.filter(d => d.sourceType === SourceTypes.CONFERENCE).length +
        ' C + ' +
        docsCurrentYear.filter(d => [SourceTypes.BOOK, SourceTypes.BOOKSERIES].includes(d.sourceType)).length +
        ' B)';

    const papers_next_yearStr = 'Nr. of papers due next year (Journal, Conference, Book): ' +
        docsNextYear.length +
        ' (' +
        docsNextYear.filter(d => d.sourceType === SourceTypes.JOURNAL).length +
        ' J + ' +
        docsNextYear.filter(d => d.sourceType === SourceTypes.CONFERENCE).length +
        ' C + ' +
        docsNextYear.filter(d => [SourceTypes.BOOK, SourceTypes.BOOKSERIES].includes(d.sourceType)).length +
        ' B)';


    const dcyIF = docsCurrentYear.map(d => {
        const metricAllYears = d.sourceMetrics.filter(m => m.name === 'IF');
        const year = Math.max(...metricAllYears.map(m => parseInt(m.year, 10)));
        d.IF = metricAllYears.find(m => m.year === year);
        return d;
    });

    const docsCurrentYearWithIF = dcyIF.filter(d => d.IF);
    const totalIFCurrentYear = docsCurrentYearWithIF.reduce((sum, d) => sum + parseFloat(d.IF.value), 0);

    return {
        'papers': papersStr,
        'papers_next_year': papers_next_yearStr,
        'papers_if': 'Nr. of papers (in current year) with IF: ' + docsCurrentYearWithIF.length,
        'total_if': 'Total IF (papers in current year): ' + totalIFCurrentYear.toFixed(2),
    };
}

function getCitationTotals(scopusCitations) {
    return scopusCitations
        .reduce((res, sc) => {
            let documentCits = res.find(r => r.document === sc.document);
            if (!documentCits) {
                documentCits = {
                    document: sc.document,
                    citations: 0
                };
                res.push(documentCits);
            }

            documentCits.citations += sc.citations;
            return res;
        }, [])
        .map(c => c.citations)
        .map(c => parseInt(c, 10));
}

async function getCitationPerYear(scopusCitations, years) {
    const citPerYear = scopusCitations.reduce((res, c) => {
        if (_.isEmpty(c) || !c.citations) return res;
        if (!res[c.year]) res[c.year] = 0;
        res[c.year] += parseInt(c.citations, 10);
        return res;
    }, {});

    return years.map(y => ({
        year: y,
        citations: citPerYear[y] || 0
    }));
}

async function getScopusCitations(documents, year) {
    const docIds = documents.map(d => d.id);
    const scopusCitations = await ScopusCitation.find({document: docIds});
    return (await Citation.find({id: scopusCitations.map(sc => sc.citation)}))
        .filter(c => c.year <= year)
        .map(c => ({
            document: scopusCitations.find(sc => sc.citation === c.id).document,
            year: c.year,
            citations: parseInt(c.citations, 10)
        }));
}

function calculateHIndex(citations) {
    if (!Array.isArray(citations))
        return;

    const cits = _.clone(citations);
    const orderedCitations = cits.sort((c1, c2) => c2 - c1);
    let h = 0;
    orderedCitations.every(c => (h >= c) ? false : ++h);
    return h;
}