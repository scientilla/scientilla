/* global SqlService, ChartData, PerformanceCalculator, DocumentTypes, SourceTypes, DocumentMetric, SourceMetric*/
const Promise = require("bluebird");
const _ = require("lodash");

module.exports = {
    getChartsData
};

async function getChartsData(researchEntityId, Model, refresh) {

    const documentTypes = DocumentTypes.get();

    const excludedDocumentTypes = [
        documentTypes[DocumentTypes.ERRATUM].id,
        documentTypes[DocumentTypes.POSTER].id,
        documentTypes[DocumentTypes.PHD_THESIS].id,
        documentTypes[DocumentTypes.REPORT].id,
        documentTypes[DocumentTypes.INVITED_TALK].id,
        documentTypes[DocumentTypes.ABSTRACT_REPORT].id
    ];

    const researchEntity = await Model.findOne({id: researchEntityId});
    const researchEntityType = researchEntity.getType();

    const mainInstituteId = 1;

    const charts = [{
        key: 'journalsByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [researchEntityId, SourceTypes.JOURNAL]
    }, {
        key: 'conferencesByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [researchEntityId, SourceTypes.CONFERENCE]
    }, {
        key: 'booksByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [researchEntityId, SourceTypes.BOOK]
    }, {
        key: 'bookChaptersByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [researchEntityId, SourceTypes.BOOKSERIES]
    }, {
        key: 'disseminationTalksByYear',
        queryName: 'invitedTalksByYear',
        fn: query,
        params: [researchEntityId, 'Dissemination']
    }, {
        key: 'scientificTalksByYear',
        queryName: 'invitedTalksByYear',
        fn: query,
        params: [researchEntityId, 'Scientific Event']
    }, {
        key: 'documentsByType',
        queryName: 'documentsByType',
        fn: query,
        params: [researchEntityId]
    }, {
        key: 'filteredAffiliatedJournalsByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.JOURNAL]
    }, {
        key: 'filteredAffiliatedConferencesByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.CONFERENCE]
    }, {
        key: 'filteredAffiliatedBooksByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOK]
    }, {
        key: 'filteredAffiliatedBookChaptersByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOKSERIES]
    }, {
        key: 'filteredNotAffiliatedJournalsByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.JOURNAL]
    }, {
        key: 'filteredNotAffiliatedConferencesByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.CONFERENCE]
    }, {
        key: 'filteredNotAffiliatedBooksByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOK]
    }, {
        key: 'filteredNotAffiliatedBookChaptersByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOKSERIES]
    }, {
        key: 'hindexPerYear',
        fn: hindexPerYear
    }, {
        key: 'citationsPerYear',
        fn: citationsPerYear
    }, {
        key: 'citationsPerDocumentYear',
        fn: citationsPerDocumentYear
    }, {
        key: 'totalIfPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'IF'
    }, {
        key: 'totalSjrPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'SJR'
    }, {
        key: 'totalSnipPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'SNIP'
    }, {
        key: 'chartDataDate',
        queryName: 'chartDataDate',
        fn: query,
        params: [researchEntityId, researchEntityType],
        nocache: true
    }];

    let documents = [];
    let citations = [];
    let docsMetrics = [];

    if (refresh || !await areChartsCached()) {
        await setDocuments();
        await setCitations();
        await setDocumentsMetrics();
    }

    const promises = charts.map(chart => cachedChartData(chart, refresh));
    const results = await Promise.all(promises);

    const res = {};
    results.forEach((r, i) => res[charts[i].key] = r);

    return {
        count: 1,
        items: [res]
    };

    async function query(chart) {
        const sql = getSql(chart.queryName);
        return await SqlService.query(sql, chart.params);
    }

    function getSql(queryName) {
        const chartQueryPath = `api/queries/${queryName}.sql`;
        const chartQuerySqlRaw = SqlService.readQueryFromFs(chartQueryPath);
        const table = researchEntityType === 'user' ? 'authorship' : 'authorshipgroup';
        //TODO change database structure to handle groups as users
        return chartQuerySqlRaw.replace(new RegExp('authorship', 'g'), table);
    }

    async function hindexPerYear() {
        if (!documents.length) return [];
        const yearRange = getYearRange(documents);
        const years = _.range(yearRange.min, new Date().getFullYear() + 1);

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

    async function getTotalMetricPerYear(chart) {
        const metrics = await SourceMetric.find({name: chart.metricName, id: docsMetrics.map(dm => dm.metric)});
        const docs = documents.map(d => {
            const documentMetricsIds = docsMetrics.filter(dm => dm.document === d.id).map(dm => dm.metric);
            const impactFactorsAllYears = metrics.filter(i => documentMetricsIds.includes(i.id));
            const year = Math.max(...impactFactorsAllYears.map(m => parseInt(m.year, 10)));
            const metric = impactFactorsAllYears.find(m => m.year === year);
            return {
                year: d.year,
                metric: metric ? parseFloat(metric.value) : 0
            };
        }).filter(d => d.metric);

        if (!docs.length) return [];
        const yearRange = getYearRange(docs);

        return _.range(yearRange.min, yearRange.max + 1)
            .map(y => {
                const yearDocs = docs.filter(c => parseInt(c.year, 10) === y);
                const yearTotal = yearDocs.reduce((res, doc) => doc.metric + res, 0);
                return {
                    year: y,
                    value: yearTotal
                };
            });
    }

    async function setDocuments() {
        const researchEntity = await Model.findOne({id: researchEntityId}).populate('documents');
        documents = researchEntity.documents.filter(d => !excludedDocumentTypes.includes(d.documenttype));
    }

    async function setCitations() {
        citations = await PerformanceCalculator.getScopusCitations(documents, new Date().getFullYear() + 1);
    }

    async function setDocumentsMetrics() {
        docsMetrics = await DocumentMetric.find({document: documents.map(d => d.id)});
    }

    async function getHIndex(year) {
        const cits = citations.filter(c => c.year <= year);
        const citationsTotals = PerformanceCalculator.getCitationTotals(cits);
        return PerformanceCalculator.calculateHIndex(citationsTotals);
    }

    async function areChartsCached() {
        const cc = charts.filter(c => !c.nocache);

        const cachedCharts = await ChartData.find({
            key: cc.map(c => c.key),
            researchEntityType: researchEntityType,
            researchEntity: researchEntityId
        });

        return cachedCharts.length === cc.length;
    }

    async function cachedChartData(chart, refresh) {
        if (!refresh && !chart.nocache) {
            const chartData = await getCachedData(chart.key);
            if (chartData)
                return chartData
        }

        const result = await chart.fn(chart);

        if (chart.nocache)
            return result;

        await cacheData(chart.key, result);

        return result;
    }

    async function getCachedData(key) {
        const res = await ChartData.findOne({
            researchEntity: researchEntityId,
            researchEntityType: researchEntityType,
            key: key
        });

        if (res)
            return res.value;
    }

    async function cacheData(key, value) {
        const chartData = await ChartData.findOrCreate({
            researchEntity: researchEntityId,
            researchEntityType: researchEntityType,
            key: key
        }, {
            researchEntity: researchEntityId,
            researchEntityType: researchEntityType,
            key: key,
            value: value
        });

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