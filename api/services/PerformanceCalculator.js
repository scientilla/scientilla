/* global sails, User, Group, Document, Citation, ScopusCitation, ScopusCitationTotal, DocumentOrigins */
"use strict";

const _ = require('lodash');

module.exports = {
    getGroupPerformance: getGroupPerformance,
    getGroupsPerformance: getGroupsPerformance,
    getUserPerformance: getUserPerformance,
    getUsersPerformance: getUsersPerformance
};


async function getGroupPerformance(group, year) {
    //TODO
}

async function getGroupsPerformance(year) {
    // TODO const groups = await Group.find({active: true}).populate('documents');
}

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


async function getResearchEntityPerformance(docs, year) {
    const documents = year ? docs.filter(d => d.year <= year) : docs;
    const citations = (await getCitationTotals(documents));
    const hIndex = calculateHIndex(citations);
    const totalCitations = citations.reduce((total, c) => total + c, 0);

    const citationsPerYear = (await getCitationPerYear(documents));
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

async function getCitationTotals(documents) {
    const docIds = documents.map(d => d.id);
    return (await ScopusCitationTotal.find({document: docIds}))
        .map(c => c.citations)
        .map(c => parseInt(c, 10));
}

async function getCitationPerYear(documents) {
    const docIds = documents.map(d => d.id);

    const scopusCitations = await ScopusCitation.find({document: docIds});
    const citPerYear = (await Citation.find({id: scopusCitations.map(sc => sc.citation)}))
        .reduce((res, c) => {
            if (_.isEmpty(c) || !c.citations) return res;
            if (!res[c.year]) res[c.year] = 0;
            res[c.year] += parseInt(c.citations, 10);
            return res;
        }, {});

    return Object.keys(citPerYear).map(y => ({
        year: y,
        citations: citPerYear[y]
    })).filter(c => c.citations);
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