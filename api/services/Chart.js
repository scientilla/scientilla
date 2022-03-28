/* global SqlService, ChartData, PerformanceCalculator, Group, DocumentTypes, SourceTypes, DocumentMetric, SourceMetric, ResearchEntityTypes */
const Promise = require("bluebird");

module.exports = {
    getChartsData,
    recalculate
};

async function getChartsData(id, Model, chartsKeys, refresh, roles) {
    const documentTypes = DocumentTypes.get();

    const excludedDocumentTypes = [
        documentTypes[DocumentTypes.ERRATUM].id,
        documentTypes[DocumentTypes.POSTER].id,
        documentTypes[DocumentTypes.PHD_THESIS].id,
        documentTypes[DocumentTypes.REPORT].id,
        documentTypes[DocumentTypes.INVITED_TALK].id,
        documentTypes[DocumentTypes.ABSTRACT_REPORT].id
    ];

    const researchEntity = await Model.findOne({id: id});
    const researchEntityType = researchEntity.getType();

    const mainInstituteId = 1;

    const charts = [{
        key: 'journalsByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [id, SourceTypes.JOURNAL],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'conferencesByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [id, SourceTypes.CONFERENCE],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'booksByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [id, SourceTypes.BOOK],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'bookSeriesByYear',
        queryName: 'documentsByYear',
        fn: query,
        params: [id, SourceTypes.BOOKSERIES],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'disseminationTalksByYear',
        queryName: 'invitedTalksByYear',
        fn: query,
        params: [id, 'Dissemination'],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'scientificTalksByYear',
        queryName: 'invitedTalksByYear',
        fn: query,
        params: [id, 'Scientific Event'],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'documentsByType',
        queryName: 'documentsByType',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredAffiliatedJournalsByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.JOURNAL],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredAffiliatedConferencesByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.CONFERENCE],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredAffiliatedBooksByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOK],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredAffiliatedBookSeriesByYear',
        queryName: 'filteredAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOKSERIES],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredNotAffiliatedJournalsByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.JOURNAL],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredNotAffiliatedConferencesByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.CONFERENCE],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredNotAffiliatedBooksByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOK],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'filteredNotAffiliatedBookSeriesByYear',
        queryName: 'filteredNotAffiliatedDocumentsByYear',
        fn: query,
        params: [id, mainInstituteId, excludedDocumentTypes, SourceTypes.BOOKSERIES],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'hindexPerYear',
        queryName: 'hindexPerYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'citationsPerYear',
        queryName: 'citationsPerYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'citationsPerDocumentYear',
        queryName: 'citationsPerDocumentYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'totalIfPerYear',
        queryName: 'totalMetricPerYear',
        fn: query,
        params: [id, 'IF'],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'totalSjrPerYear',
        queryName: 'totalMetricPerYear',
        fn: query,
        params: [id, 'SJR'],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'totalSnipPerYear',
        queryName: 'totalMetricPerYear',
        fn: query,
        params: [id, 'SNIP'],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'chartDataDate',
        queryName: 'chartDataDate',
        fn: query,
        params: [id, researchEntityType],
        nocache: true,
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersTotal',
        queryName: 'groupMembersTotal',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersTotal',
        queryName: 'groupAndSubgroupMembersTotal',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByRole',
        queryName: 'groupMembersByRole',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByRole',
        queryName: 'groupAndSubgroupMembersByRole',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByGender',
        queryName: 'groupMembersByGender',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByGenderOfRoles',
        queryName: 'groupMembersByGenderOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByGender',
        queryName: 'groupAndSubgroupMembersByGender',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByGenderOfRoles',
        queryName: 'groupAndSubgroupMembersByGenderOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByAgeRange',
        queryName: 'groupMembersByAgeRange',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByAgeRangeOfRoles',
        queryName: 'groupMembersByAgeRangeOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByAgeRange',
        queryName: 'groupAndSubgroupMembersByAgeRange',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByAgeRangeOfRoles',
        queryName: 'groupAndSubgroupMembersByAgeRangeOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByNationality',
        queryName: 'groupMembersByNationality',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupMembersByNationalityOfRoles',
        queryName: 'groupMembersByNationalityOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByNationality',
        queryName: 'groupAndSubgroupMembersByNationality',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'groupAndSubgroupMembersByNationalityOfRoles',
        queryName: 'groupAndSubgroupMembersByNationalityOfRoles',
        fn: query,
        params: [id, roles],
        researchEntityTypes: [ResearchEntityTypes.GROUP]
    }, {
        key: 'annualContributionCompetitiveProjectsByYear',
        queryName: 'annualContributionCompetitiveProjectsByYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'annualContributionIndustrialProjectsByYear',
        queryName: 'annualContributionIndustrialProjectsByYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'totalContributionIndustrialProjectsByYear',
        queryName: 'totalContributionIndustrialProjectsByYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'totalContributionCompetitiveProjectsByYear',
        queryName: 'totalContributionCompetitiveProjectsByYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }, {
        key: 'priorityAndProsecutionPatentsByYear',
        queryName: 'priorityAndProsecutionPatentsByYear',
        fn: query,
        params: [id],
        researchEntityTypes: [ResearchEntityTypes.USER, ResearchEntityTypes.GROUP]
    }];

    let selectedCharts;
    if (chartsKeys.length > 0)
        selectedCharts = charts.filter(c => chartsKeys.includes(c.key) && c.researchEntityTypes.includes(researchEntityType));
    else
        selectedCharts = charts.filter(c => c.researchEntityTypes.includes(researchEntityType));


    const promises = selectedCharts.map(chart => cachedChartData(chart, refresh));
    const results = await Promise.all(promises);

    const res = {};
    results.forEach((r, i) => res[selectedCharts[i].key] = r);

    return {
        count: 1,
        items: [res]
    };

    async function query(chart) {
        const sql = getSql(chart.queryName);
        return await SqlService.query(sql, chart.params);
    }

    function getSql(queryName) {
        const queries = {};
        queries[ResearchEntityTypes.USER] = {
            'filteredAffiliatedDocumentsByYear': 'filteredAffiliatedDocumentsByYear',
            'filteredNotAffiliatedDocumentsByYear': 'filteredNotAffiliatedDocumentsByYear',
            'invitedTalksByYear': 'invitedTalksByYear',
            'priorityAndProsecutionPatentsByYear': 'userPriorityAndProsecutionPatentsByYear',
            'annualContributionCompetitiveProjectsByYear': 'userAnnualContributionCompetitiveProjectsByYear',
            'annualContributionIndustrialProjectsByYear': 'userAnnualContributionIndustrialProjectsByYear',
            'totalContributionIndustrialProjectsByYear': 'userTotalContributionIndustrialProjectsByYear',
            'totalContributionCompetitiveProjectsByYear': 'userTotalContributionCompetitiveProjectsByYear'
        };

        queries[ResearchEntityTypes.GROUP] = {
            'filteredAffiliatedDocumentsByYear': 'filteredAffiliatedDocumentsByYearGroup',
            'filteredNotAffiliatedDocumentsByYear': 'filteredNotAffiliatedDocumentsByYearGroup',
            'invitedTalksByYear': 'invitedTalksByYear',
            'groupMembersTotal': 'groupMembersTotal',
            'groupAndSubgroupMembersTotal': 'groupAndSubgroupMembersTotal',
            'groupMembersByRole': 'groupMembersByRole',
            'groupAndSubgroupMembersByRole': 'groupAndSubgroupMembersByRole',
            'groupMembersByGender': 'groupMembersByGender',
            'groupMembersByGenderOfRoles': 'groupMembersByGenderOfRoles',
            'groupAndSubgroupMembersByGender': 'groupAndSubgroupMembersByGender',
            'groupAndSubgroupMembersByGenderOfRoles': 'groupAndSubgroupMembersByGenderOfRoles',
            'groupMembersByAgeRange': 'groupMembersByAgeRange',
            'groupMembersByAgeRangeOfRoles': 'groupMembersByAgeRangeOfRoles',
            'groupAndSubgroupMembersByAgeRange': 'groupAndSubgroupMembersByAgeRange',
            'groupAndSubgroupMembersByAgeRangeOfRoles': 'groupAndSubgroupMembersByAgeRangeOfRoles',
            'groupMembersByNationality': 'groupMembersByNationality',
            'groupMembersByNationalityOfRoles': 'groupMembersByNationalityOfRoles',
            'groupAndSubgroupMembersByNationality': 'groupAndSubgroupMembersByNationality',
            'groupAndSubgroupMembersByNationalityOfRoles': 'groupAndSubgroupMembersByNationalityOfRoles',
            'priorityAndProsecutionPatentsByYear': 'groupPriorityAndProsecutionPatentsByYear',
            'annualContributionCompetitiveProjectsByYear': 'groupAnnualContributionCompetitiveProjectsByYear',
            'annualContributionIndustrialProjectsByYear': 'groupAnnualContributionIndustrialProjectsByYear',
            'totalContributionIndustrialProjectsByYear': 'groupTotalContributionIndustrialProjectsByYear',
            'totalContributionCompetitiveProjectsByYear': 'groupTotalContributionCompetitiveProjectsByYear'
        };
        const transforms = {};
        transforms[ResearchEntityTypes.USER] = {};
        transforms[ResearchEntityTypes.GROUP] = {
            'documentsByType': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'documentsByYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'invitedTalksByYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'hindexPerYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'citationsPerYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'citationsPerDocumentYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
            'totalMetricPerYear': (q) => q.replace(/authorship/g, 'authorshipgroup'),
        };
        const sqlFileName = queries[researchEntityType][queryName] ? queries[researchEntityType][queryName] : queryName;
        const chartQueryPath = `api/queries/${sqlFileName}.sql`;
        const chartQuerySql = SqlService.readQueryFromFs(chartQueryPath);
        return transforms[researchEntityType][queryName] ?
            transforms[researchEntityType][queryName](chartQuerySql) :
            chartQuerySql;
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
            researchEntity: id,
            researchEntityType: researchEntityType,
            key: key
        });

        if (res)
            return res.value;
    }

    async function cacheData(key, value) {
        const chartData = await ChartData.findOrCreate({
            researchEntity: id,
            researchEntityType: researchEntityType,
            key: key
        }, {
            researchEntity: id,
            researchEntityType: researchEntityType,
            key: key,
            value: value
        });

        await ChartData.update({id: chartData.id}, {
            researchEntity: id,
            researchEntityType: researchEntityType,
            key: key,
            value: value
        });

    }
}

async function recalculate(groupId) {
    const chartKeys = [
        'journalsByYear',
        'conferencesByYear',
        'booksByYear',
        'bookSeriesByYear',
        'documentsByType',
        'disseminationTalksByYear',
        'scientificTalksByYear',
        'filteredAffiliatedJournalsByYear',
        'filteredAffiliatedConferencesByYear',
        'filteredAffiliatedBooksByYear',
        'filteredAffiliatedBookSeriesByYear',
        'filteredNotAffiliatedJournalsByYear',
        'filteredNotAffiliatedConferencesByYear',
        'filteredNotAffiliatedBooksByYear',
        'filteredNotAffiliatedBookSeriesByYear',
        'hindexPerYear',
        'citationsPerYear',
        'citationsPerDocumentYear',
        'totalIfPerYear',
        'totalSjrPerYear',
        'totalSnipPerYear',
        'chartDataDate',
        'annualContributionCompetitiveProjectsByYear',
        'annualContributionIndustrialProjectsByYear',
        'totalContributionIndustrialProjectsByYear',
        'totalContributionCompetitiveProjectsByYear',
        'priorityAndProsecutionPatentsByYear'
    ]

    await getChartsData(groupId, Group, chartKeys, true, []);
}
