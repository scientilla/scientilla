/* global sails, User, Group, Document, Authorship, Citation, ScopusCitation, DocumentOrigins, SourceTypes, DocumentTypes, SourceType */
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
    getUserMBOInvitedTalks,
    getUsersMBOInvitedTalks,
    getGroupMBOInvitedTalks,
    getGroupsMBOInvitedTalks
};

async function getUserPerformance(user, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const performance = await getResearchEntityPerformance(user.documents, y);
    return formatPerformance({
            email: user.username,
            lastname: user.surname,
            name: user.name
        },
        performance);
}

async function getUsersPerformance(year) {
    return await calculateForAll(User, getUserPerformance, year);
}

async function getGroupInstitutePerformance(group, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const docs = group.documents.filter(d => parseInt(d.year, 10) === y || parseInt(d.year, 10) === y + 1);
    const documents = await Document.find({id: docs.map(d => d.id)}).populate('sourceMetrics');
    const performance = await getResearchEntityInstitutePerformance(documents, y);
    return formatInstitutePerformance({
            cdr: group.cdr,
            line: group.name
        },
        performance
    );
}

async function getGroupsInstitutePerformance(year) {
    return await calculateForAll(Group, getGroupInstitutePerformance, year);
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
    return formatInstitutePerformance({
            email: user.username,
            lastname: user.surname,
            name: user.name
        },
        performance);
}

async function getUsersInstitutePerformance(year) {
    return await calculateForAll(User, getUserInstitutePerformance, year);
}

async function getUserMBOInvitedTalks(user, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const res = await getResearchEntityMBOInvitedTalks(user.documents, y);

    return Object.assign({}, {
        email: user.username,
        lastname: user.surname,
        name: user.name,
        year: y
    }, res);
}

async function getUsersMBOInvitedTalks(year) {
    return await calculateForAll(User, getUserMBOInvitedTalks, year);
}

async function getGroupMBOInvitedTalks(group, year) {
    const y = parseInt(year) || (new Date()).getFullYear();
    const res = await getResearchEntityMBOInvitedTalks(group.documents, y);

    return Object.assign({}, {
        cdr: group.cdr,
        line: group.name,
        year: y
    }, res);
}

async function getGroupsMBOInvitedTalks(year) {
    return await calculateForAll(Group, getGroupMBOInvitedTalks, year);
}

async function getResearchEntityMBOInvitedTalks(docs, year) {
    function formatIT(doc) {
        return doc.title + ' - ' + doc.itSource;
    }

    function formatOutput(sourceTypes, invitedTalks) {
        return sourceTypes.reduce((res, st) => {
            const filteredIT = invitedTalks.filter(d => d.sourceType === st.key);
            if (filteredIT.length)
                res.push({
                    title: st.label,
                    value: filteredIT.map(formatIT)
                });
            return res;
        }, []);
    }

    const invitedTalks = docs.filter(d => parseInt(d.year, 10) === year && d.type === DocumentTypes.INVITED_TALK);

    const sourceTypes = (await SourceTypes.get()).filter(st => st.type === 'invited_talk');
    const scientificSourceTypes = sourceTypes.filter(st => st.section === 'Scientific Event');
    const disseminationSourceTypes = sourceTypes.filter(st => st.section === 'Dissemination');

    const scientific = formatOutput(scientificSourceTypes, invitedTalks);
    const dissemination = formatOutput(disseminationSourceTypes, invitedTalks);

    return {scientific, dissemination};

}


async function getResearchEntityPerformance(docs, year) {
    const documents = docs.filter(d => d.year <= year);
    const scopusCitations = await getScopusCitations(documents, year);
    const citations = getCitationTotals(scopusCitations);
    const hIndex = calculateHIndex(citations);
    const totalCitations = citations.reduce((total, c) => total + c, 0);

    const years = _.range(citation_year_count, 0).map(i => i + parseInt(year, 10) - citation_year_count);
    const citationsPerYear = (await getCitationPerYear(scopusCitations, years));

    const source_date = await Citation.findOne({origin: DocumentOrigins.SCOPUS}).sort('updatedAt DESC');
    return {
        hindex: hIndex,
        total_citations: totalCitations,
        citations_years: citationsPerYear,
        source_date: source_date
    };
}

async function getResearchEntityInstitutePerformance(documents, year) {
    const excludedDocumentTypes = [
        DocumentTypes.ERRATUM,
        DocumentTypes.POSTER,
        DocumentTypes.PHD_THESIS,
        DocumentTypes.REPORT,
        DocumentTypes.INVITED_TALK,
        DocumentTypes.ABSTRACT_REPORT
    ];
    const docs = documents.filter(d => !excludedDocumentTypes.includes(d.type));
    const docsCurrentYear = docs.filter(d => parseInt(d.year, 10) === year);
    const docsNextYear = docs.filter(d => parseInt(d.year, 10) === (year + 1));

    const papersStr = {
        total: docsCurrentYear.length,
        journal: docsCurrentYear.filter(d => d.sourceType === SourceTypes.JOURNAL).length,
        conference: docsCurrentYear.filter(d => d.sourceType === SourceTypes.CONFERENCE).length,
        book: docsCurrentYear.filter(d => [SourceTypes.BOOK, SourceTypes.BOOKSERIES].includes(d.sourceType)).length
    };

    const papers_next_yearStr = {
        total: docsNextYear.length,
        journal: docsNextYear.filter(d => d.sourceType === SourceTypes.JOURNAL).length,
        conference: docsNextYear.filter(d => d.sourceType === SourceTypes.CONFERENCE).length,
        book: docsNextYear.filter(d => [SourceTypes.BOOK, SourceTypes.BOOKSERIES].includes(d.sourceType)).length
    };

    const dcyIF = docsCurrentYear.map(d => {
        const metricAllYears = d.sourceMetrics.filter(m => m.name === 'IF');
        const year = Math.max(...metricAllYears.map(m => parseInt(m.year, 10)));
        d.IF = metricAllYears.find(m => m.year === year);
        return d;
    });

    const docsCurrentYearWithIF = dcyIF.filter(d => d.IF);
    const totalIFCurrentYear = docsCurrentYearWithIF.reduce((sum, d) => sum + parseFloat(d.IF.value), 0);

    return {
        papers: papersStr,
        papers_next_year: papers_next_yearStr,
        papers_if: docsCurrentYearWithIF.length,
        total_if: totalIFCurrentYear.toFixed(2),
    };
}

function formatPerformance(researchEntityData, performance) {
    const citationsYearStr = performance.citations_years.map(cpy => cpy.year + ':' + cpy.citations).join(', ');
    const dataUpTo = performance.source_date.updatedAt.getDate() + '/' +
        performance.source_date.updatedAt.getMonth() + '/' +
        performance.source_date.updatedAt.getFullYear();
    return Object.assign({}, researchEntityData, {
        hindex: {
            title: 'h-index',
            value: performance.hindex,
            str: 'h-index: ' + performance.hindex
        },
        total_citations: {
            title: 'Total Citations',
            value: performance.total_citations,
            str: 'Total Citations: ' + performance.total_citations
        },
        citations_years: {
            title: 'Nr. of citations per year',
            value: performance.citations_years,
            str: 'Nr. of citations per year: ' + citationsYearStr,
        },
        source: {
            str: '(Citations from Scopus - data up to ' + dataUpTo + ')'
        }
    });
}

function formatInstitutePerformance(researchEntityData, performance) {
    return Object.assign({}, researchEntityData, {
        papers: {
            title: 'Nr. of papers in current year (Journal, Conference, Book)',
            value: performance.papers,
            str: formatPapers(performance.papers, 'Nr. of papers due current year (Journal, Conference, Book):')
        },
        papers_next_year: {
            title: 'Nr. of papers due next year (Journal, Conference, Book)',
            value: performance.papers_next_year,
            str: formatPapers(performance.papers_next_year, 'Nr. of papers due next year (Journal, Conference, Book):')
        },
        papers_if: {
            title: 'Nr. of papers (in current year) with IF',
            value: performance.papers_if,
            str: 'Nr. of papers (in current year) with IF: ' + performance.papers_if
        },
        total_if: {
            title: 'Total IF (papers in current year)',
            value: performance.total_if,
            str: 'Total IF (papers in current year): ' + performance.total_if
        },
        source: {
            str: '(Publications from SCIENTILLA and Impact Factor from Web of Science)'
        },
    });

    function formatPapers(papers, prefix) {
        return prefix + ' ' +
            papers.total +
            ' ( ' + papers.journal + ' J + ' +
            papers.conference + 'C + ' +
            papers.book + ' B )'
    }
}

async function calculateForAll(ResearchEntityModel, fn, ...params) {
    const researchEntities = await ResearchEntityModel.find().populate('documents');
    const res = [];
    for (const researchEntity of researchEntities)
        if (!_.isEmpty(researchEntity.documents))
            res.push(await fn(researchEntity, params));

    return res;
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