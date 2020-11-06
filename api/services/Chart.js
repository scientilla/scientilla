/* global SqlService, ChartData, PerformanceCalculator, DocumentTypes, SourceTypes, DocumentMetric, SourceMetric*/
const Promise = require("bluebird");
const _ = require("lodash");

module.exports = {
    getChartsData
};

async function getChartsData(researchEntityId, Model, chartsKeys, refresh, role) {

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
        key: 'bookSeriesByYear',
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
        key: 'filteredAffiliatedBookSeriesByYear',
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
        key: 'filteredNotAffiliatedBookSeriesByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [researchEntityId, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOKSERIES]
    }, {
        key: 'hindexPerYear',
        fn: hindexPerYear,
        requires: ['documents', 'citations']
    }, {
        key: 'citationsPerYear',
        fn: citationsPerYear,
        requires: ['citations']
    }, {
        key: 'citationsPerDocumentYear',
        fn: citationsPerDocumentYear,
        requires: ['documents', 'citations']
    }, {
        key: 'totalIfPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'IF',
        requires: ['documents', 'docsMetrics', 'metrics']
    }, {
        key: 'totalSjrPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'SJR',
        requires: ['documents', 'docsMetrics', 'metrics']
    }, {
        key: 'totalSnipPerYear',
        fn: getTotalMetricPerYear,
        metricName: 'SNIP',
        requires: ['documents', 'docsMetrics', 'metrics']
    }, {
        key: 'chartDataDate',
        queryName: 'chartDataDate',
        fn: query,
        params: [researchEntityId, researchEntityType],
        nocache: true
    }, {
        key: 'groupMembersByRole',
        queryName: 'groupMembersByRole',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupAndSubgroupMembersByRole',
        queryName: 'groupAndSubgroupMembersByRole',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupMembersByGender',
        queryName: 'groupMembersByGender',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupMembersByGenderOfRole',
        queryName: 'groupMembersByGenderOfRole',
        fn: query,
        params: [researchEntityId, role]
    },  {
        key: 'groupAndSubgroupMembersByGender',
        queryName: 'groupAndSubgroupMembersByGender',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupAndSubgroupMembersByGenderOfRole',
        queryName: 'groupAndSubgroupMembersByGenderOfRole',
        fn: query,
        params: [researchEntityId, role]
    },  {
        key: 'groupMembersByAgeRange',
        queryName: 'groupMembersByAgeRange',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupMembersByAgeRangeOfRole',
        queryName: 'groupMembersByAgeRangeOfRole',
        fn: query,
        params: [researchEntityId, role]
    },  {
        key: 'groupAndSubgroupMembersByAgeRange',
        queryName: 'groupAndSubgroupMembersByAgeRange',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupAndSubgroupMembersByAgeRangeOfRole',
        queryName: 'groupAndSubgroupMembersByAgeRangeOfRole',
        fn: query,
        params: [researchEntityId, role]
    },  {
        key: 'groupMembersByNationality',
        queryName: 'groupMembersByNationality',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupMembersByNationalityOfRole',
        queryName: 'groupMembersByNationalityOfRole',
        fn: query,
        params: [researchEntityId, role]
    },  {
        key: 'groupAndSubgroupMembersByNationality',
        queryName: 'groupAndSubgroupMembersByNationality',
        fn: query,
        params: [researchEntityId]
    },  {
        key: 'groupAndSubgroupMembersByNationalityOfRole',
        queryName: 'groupAndSubgroupMembersByNationalityOfRole',
        fn: query,
        params: [researchEntityId, role]
    }];

    let selectedCharts = [];
    let documents = [];
    let citations = [];
    let docsMetrics = [];
    let metrics = [];

    await setData();

    const promises = selectedCharts.map(chart => cachedChartData(chart, refresh));
    const results = await Promise.all(promises);

    const res = {};
    results.forEach((r, i) => res[selectedCharts[i].key] = r);

    return {
        count: 1,
        items: [res]
    };

    async function setData() {

        if (chartsKeys.length > 0)
            selectedCharts = charts.filter(c => chartsKeys.includes(c.key));
        else
            selectedCharts = charts;

        if (refresh || !await areChartsCached()) {
            if (selectedCharts.find(sc =>
                sc.requires
                && (
                    sc.requires.includes('documents')
                    || sc.requires.includes('citations')
                    || sc.requires.includes('docsMetrics')
                    || sc.requires.includes('metrics')
                )))
                await setDocuments();

            if (selectedCharts.find(sc => sc.requires && sc.requires.includes('citations')))
                await setCitations();

            if (selectedCharts.find(sc => sc.requires && (sc.requires.includes('docsMetrics') || sc.requires.includes('metrics'))))
                await setDocumentsMetrics();

            if (selectedCharts.find(sc => sc.requires && sc.requires.includes('metrics')))
                await setMetrics();
        }
    }


    async function query(chart) {
        const sql = getSql(chart.queryName);
        return await SqlService.query(sql, chart.params);
    }

    function getSql(queryName) {
        const queries = {
            'user': {
                'chartDataDate': 'chartDataDate',
                'documentsByType': 'documentsByType',
                'documentsByYear': 'documentsByYear',
                'filteredAffiliatedDocumentsByYear': 'filteredAffiliatedDocumentsByYear',
                'filteredNotAffiliatedDocumentsByYear': 'filteredNotAffiliatedDocumentsByYear',
                'invitedTalksByYear': 'invitedTalksByYear'
            },
            'group': {
                'chartDataDate': 'chartDataDate',
                'documentsByType': 'documentsByType',
                'documentsByYear': 'documentsByYear',
                'filteredAffiliatedDocumentsByYear': 'filteredAffiliatedDocumentsByYearGroup',
                'filteredNotAffiliatedDocumentsByYear': 'filteredNotAffiliatedDocumentsByYearGroup',
                'invitedTalksByYear': 'invitedTalksByYear',
                'groupMembersByRole': 'groupMembersByRole',
                'groupAndSubgroupMembersByRole': 'groupAndSubgroupMembersByRole',
                'groupMembersByGender': 'groupMembersByGender',
                'groupMembersByGenderOfRole': 'groupMembersByGenderOfRole',
                'groupAndSubgroupMembersByGender': 'groupAndSubgroupMembersByGender',
                'groupAndSubgroupMembersByGenderOfRole': 'groupAndSubgroupMembersByGenderOfRole',
                'groupMembersByAgeRange': 'groupMembersByAgeRange',
                'groupMembersByAgeRangeOfRole': 'groupMembersByAgeRangeOfRole',
                'groupAndSubgroupMembersByAgeRange': 'groupAndSubgroupMembersByAgeRange',
                'groupAndSubgroupMembersByAgeRangeOfRole': 'groupAndSubgroupMembersByAgeRangeOfRole',
                'groupMembersByNationality': 'groupMembersByNationality',
                'groupMembersByNationalityOfRole': 'groupMembersByNationalityOfRole',
                'groupAndSubgroupMembersByNationality': 'groupAndSubgroupMembersByNationality',
                'groupAndSubgroupMembersByNationalityOfRole': 'groupAndSubgroupMembersByNationalityOfRole'
            }
        };
        const transforms = {
            'user': {},
            'group': {
                'documentsByType': (q) => q.replace(/authorship/g, 'authorshipgroup'),
                'documentsByYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
                'invitedTalksByYear': (q) => q.replace(/authorship/g, 'authorshipgroup')
            }
        };
        const chartQueryPath = `api/queries/${queries[researchEntityType][queryName]}.sql`;
        const chartQuerySql = SqlService.readQueryFromFs(chartQueryPath);
        return transforms[researchEntityType][queryName] ?
            transforms[researchEntityType][queryName](chartQuerySql) :
            chartQuerySql;
    }

    async function hindexPerYear() {
        if (!documents.length) return [];
        const yearRange = getYearRange(documents);
        const years = _.range(yearRange.min, Math.max(new Date().getFullYear(), yearRange.max) + 1);
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
                const yearCitations = citations.filter(c => parseInt(c.year, 10) === y);
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
        const chartMetrics = metrics.filter(dm => dm.name === chart.metricName);
        const docs = documents.map(d => {
            const documentMetricsIds = docsMetrics.filter(dm => dm.document === d.id).map(dm => dm.metric);
            const impactFactorsAllYears = chartMetrics.filter(i => documentMetricsIds.includes(i.id));
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

    async function setMetrics() {
        const docsMetricsIds = docsMetrics.map(dm => dm.metric);
        const filterOnQuery = docsMetricsIds.length < 2000;

        const query = {name: ['IF', 'SJR', 'SNIP']};
        if (filterOnQuery)
            query.id = docsMetricsIds;

        metrics = (await SourceMetric.find(query));

        if (!filterOnQuery)
            metrics = metrics.filter(dm => docsMetricsIds.includes(dm.id));
    }

    async function getHIndex(year) {
        const cits = citations.filter(c => c.year <= year);
        const citationsTotals = PerformanceCalculator.getCitationTotals(cits);
        return PerformanceCalculator.calculateHIndex(citationsTotals);
    }

    async function areChartsCached() {
        const cc = selectedCharts.filter(c => !c.nocache);

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