/* global SqlService, ChartData, PerformanceCalculator, DocumentTypes, DocumentMetric, SourceMetric*/
const Promise = require("bluebird");
const _ = require("lodash");

module.exports = {
    getChartsData
};

async function getChartsData(researchEntityId, Model, refresh) {
    const charts = [
        {
            key: 'journalsByYear',
            fn: query
        },
        {
            key: 'conferencesByYear',
            fn: query
        },
        {
            key: 'booksByYear',
            fn: query
        },
        {
            key: 'bookChaptersByYear',
            fn: query
        },
        {
            key: 'disseminationTalksByYear',
            fn: query
        },
        {
            key: 'scientificTalksByYear',
            fn: query
        },
        {
            key: 'documentsByType',
            fn: query
        },
        {
            key: 'hindexPerYear',
            fn: hindexPerYear
        },
        {
            key: 'citationsPerYear',
            fn: citationsPerYear
        },
        {
            key: 'citationsPerDocumentYear',
            fn: citationsPerDocumentYear
        },
        {
            key: 'totaIfPerYear',
            fn: totaIfPerYear
        },
        {
            key: 'chartDataDate',
            fn: query
        }
    ];

    const researchEntity = await Model.findOne({id: researchEntityId});
    const researchEntityType = researchEntity.getType();

    let documents = [];
    let citations = [];

    if (refresh || !await areChartsCached()) {
        await setDocuments();
        await setCitations();
    }

    const promises = charts.map(chart => cachedChartData(researchEntityId, researchEntityType, chart, chart.fn, refresh));
    const results = await Promise.all(promises);

    const res = {};
    results.forEach((r, i) => res[charts[i].key] = r);

    return {
        count: 1,
        items: [res]
    };

    async function query(id, type, chart) {
        const chartQueryPath = `api/queries/${chart.key}.sql`;
        const chartQuerySqlRaw = SqlService.readQueryFromFs(chartQueryPath);
        const table = type === 'user' ? 'authorship' : 'authorshipgroup';
        //TODO change database structure to handle groups as users
        const chartQuerySql = chartQuerySqlRaw.replace('authorship', table);
        return await SqlService.query(chartQuerySql, [id, type]);
    }

    async function hindexPerYear() {
        if (!documents.length) return [];
        const yearRange = getYearRange(documents);
        const years = _.range(yearRange.min, yearRange.max + 1);

        return await Promise.all(years.map(async y => ({
                year: y,
                value: await getHIndex(y)
            })
        ));
    }

    async function citationsPerYear() {
        if (!citations.length) return [];
        const yearRange = getYearRange(citations);

        return _.range(yearRange.min, yearRange.max + 1)
            .map(y => {
                const yearCitations = citations.filter(c => c.year === y);
                const yearTotal = yearCitations.reduce((res, cit) => cit.citations + res, 0);
                return {
                    year: y,
                    value: yearTotal
                };
            });
    }

    async function citationsPerDocumentYear() {
        const documentYearCitations = citations.map(c => ({
            year: parseInt(documents.find(d => d.id === c.document).year, 10),
            citations: c.citations
        }));

        if (!documentYearCitations.length) return [];
        const yearRange = getYearRange(documentYearCitations);

        return _.range(yearRange.min, yearRange.max + 1)
            .map(y => {
                const yearCitations = documentYearCitations.filter(c => c.year === y);
                const yearTotal = yearCitations.reduce((res, cit) => cit.citations + res, 0);
                return {
                    year: y,
                    value: yearTotal
                };
            });
    }

    async function totaIfPerYear() {
        const docsMetrics = await DocumentMetric.find({document: documents.map(d => d.id)});
        const impactFactors = await SourceMetric.find({name: 'IF', id: docsMetrics.map(dm => dm.metric)});
        const docs = documents.map(d => {
            const documentMetricsIds = docsMetrics.filter(dm => dm.document === d.id).map(dm => dm.metric);
            const impactFactorsAllYears = impactFactors.filter(i => documentMetricsIds.includes(i.id));
            const year = Math.max(...impactFactorsAllYears.map(m => parseInt(m.year, 10)));
            const IF = impactFactorsAllYears.find(m => m.year === year);
            return {
                year: d.year,
                IF: IF ? parseFloat(IF.value) : 0
            };
        }).filter(d => d.IF);

        if (!docs.length) return [];
        const yearRange = getYearRange(docs);

        return _.range(yearRange.min, yearRange.max + 1)
            .map(y => {
                const yearDocs = docs.filter(c => parseInt(c.year, 10) === y);
                const yearTotal = yearDocs.reduce((res, doc) => doc.IF + res, 0);
                return {
                    year: y,
                    value: yearTotal
                };
            });
    }

    async function setDocuments() {
        const excludedDocumentTypes = [
            DocumentTypes.ERRATUM,
            DocumentTypes.POSTER,
            DocumentTypes.PHD_THESIS,
            DocumentTypes.REPORT,
            DocumentTypes.INVITED_TALK,
            DocumentTypes.ABSTRACT_REPORT
        ];
        const researchEntity = await Model.findOne({id: researchEntityId}).populate('documents');
        documents = researchEntity.documents.filter(d => !excludedDocumentTypes.includes(d.type));
    }

    async function setCitations() {
        citations = await PerformanceCalculator.getScopusCitations(documents, new Date().getFullYear() + 1);
    }

    async function getHIndex(year) {
        const cits = citations.filter(c => c.year <= year);
        const citationsTotals = PerformanceCalculator.getCitationTotals(cits);
        return PerformanceCalculator.calculateHIndex(citationsTotals);
    }

    async function areChartsCached() {
        const cachedCharts = await ChartData.find({
            key: charts.map(c => c.key),
            researchEntityType: researchEntityType,
            researchEntity: researchEntityId
        });

        return cachedCharts.length === charts.length;
    }


    async function cachedChartData(id, type, chart, fn, refresh) {
        if (!refresh) {
            const chartData = await getCachedData(id, type, chart.key);
            if (chartData)
                return chartData
        }

        const result = await fn(id, type, chart);

        await cacheData(id, type, chart.key, result);

        return result;
    }

    async function getCachedData(researchEntityId, researchEntityType, key) {
        const res = await ChartData.findOne({
            researchEntity: researchEntityId,
            researchEntityType: researchEntityType,
            key: key
        });

        if (res)
            return res.value;
    }

    async function cacheData(researchEntityId, researchEntityType, key, value) {
        const chartData = await ChartData.findOne({
            researchEntity: researchEntityId,
            researchEntityType: researchEntityType,
            key: key
        });
        if (!chartData)
            await ChartData.create({
                researchEntity: researchEntityId,
                researchEntityType: researchEntityType,
                key: key,
                value: value
            });
        else
            await ChartData.update({id: chartData.id}, {
                researchEntity: researchEntityId,
                researchEntityType: researchEntityType,
                key: key,
                value: value
            });

    }
}

function getYearRange(elements) {
    return {
        min: parseInt(_.minBy(elements, 'year').year, 10),
        max: parseInt(_.maxBy(elements, 'year').year, 10),
    };
}