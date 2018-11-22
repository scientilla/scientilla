/* global d3 */
(function () {
    "use strict";
    angular.module("services").factory("ChartService", ChartService);

    ChartService.$inject = [
        'DocumentTypesService'
    ];

    const metricsColors = [
        '#2ca02c', // IF
        '#9467bd', // SJR
        '#118798' // SNIP
    ];

    const sourceTypesColors = [
        '#0072AF', // journal
        '#aec7e8', // conference
        '#ff7f0e', // book
        '#ffbb78' // book series
    ];

    function ChartService(DocumentTypesService) {
        const service = {
            previewDefaultOptions: {
                chart: {
                    showLabels: false,
                    showLegend: false,
                    showControls: false,
                    duration: 300,
                    reduceXTicks: true,
                    xAxis: {
                        axisLabel: '',
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        axisLabel: '',
                        tickFormat: d => d3.format('')(d)
                    },
                    valueFormat: d => d3.format('')(d)
                }
            },
            mainChartDefaultOptions: {
                chart: {
                    showLabels: true,
                    showLegend: true,
                    showControls: true,
                    duration: 300,
                    reduceXTicks: false,
                    xAxis: {
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        tickFormat: d => d3.format('')(d)
                    },
                    valueFormat: d => d3.format('')(d)
                }
            }
        };

        service.getAsMainChart = chart => {
            const mainChart = _.cloneDeep(chart);
            mainChart.options = getDefaultOptions(mainChart.baseOptions, service.mainChartDefaultOptions);

            return mainChart;
        };

        service.getAsPreviewChart = c => {
            const chart = _.cloneDeep(c);
            chart.options = getDefaultOptions(chart.baseOptions, service.previewDefaultOptions);

            return chart;
        };

        service.getDocumentsByType = (chartsData) => {
            const baseOptions = {
                chart: {
                    type: 'pieChart',
                    x: d => d.type,
                    y: d => d.value,
                    labelThreshold: 0.02,
                    labelSunbeamLayout: true
                }
            };

            return {
                title: 'Documents by Type',
                data: chartsData.documentsByType.map(d => ({
                    type: DocumentTypesService.getDocumentTypeLabel(d.type),
                    value: parseInt(d.value)
                })),
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getInvitedTalksByYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const range = getRange(
                yearRange.min,
                yearRange.max
            );
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        axisLabel: '',
                        axisLabelDistance: -10
                    }
                }
            };

            return {
                title: 'Invited talks by year',
                data: [{
                    key: 'Dissemination',
                    values: getItemsByYear(chartsData.disseminationTalksByYear, yearRange)
                }, {
                    key: 'Scientific Event',
                    values: getItemsByYear(chartsData.scientificTalksByYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getDocumentsByYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
                    color: sourceTypesColors,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        axisLabel: '',
                        axisLabelDistance: -10
                    }
                }
            };

            return {
                title: 'Documents by year',
                data: [{
                    key: DocumentTypesService.getSourceTypeLabel('journal'),
                    values: getItemsByYear(chartsData.journalsByYear, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('conference'),
                    values: getItemsByYear(chartsData.conferencesByYear, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('book'),
                    values: getItemsByYear(chartsData.booksByYear, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('bookseries'),
                    values: getItemsByYear(chartsData.bookChaptersByYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getHindexPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const hindexPerYear = getItemsByYear(chartsData.hindexPerYear, yearRange);

            const maxYValue = parseInt(_.maxBy(hindexPerYear, 'value').value, 10);
            const maxXValue = parseInt(_.maxBy(hindexPerYear, 'year').year, 10);
            const minXValue = parseInt(_.minBy(hindexPerYear, 'year').year, 10);

            const range = getRange(
                _.minBy(hindexPerYear, 'year').year,
                _.maxBy(hindexPerYear, 'year').year
            );

            return {
                title: 'h-index by year',
                data: [{
                    key: 'h-index',
                    values: hindexPerYear
                }],
                options: {
                    chart: {
                        type: 'lineChart',
                        color: () => '#a94442',
                        x: d => d.year,
                        y: d => d.value,
                        showLabels: true,
                        showLegend: false,
                        showControls: false,
                        useInteractiveGuideline: true,
                        reduceXTicks: false,
                        xAxis: {
                            rotateLabels: 50,
                            showMaxMin: false,
                            tickValues: range,
                            tickFormat: d => d3.format('')(d)
                        },
                        yAxis: {
                            showMaxMin: false,
                            tickFormat: d => d3.format('')(d)
                        },
                        yDomain: [0, maxYValue + (maxYValue * 0.05)],
                        xDomain: [minXValue, maxXValue + ((maxXValue - minXValue) * 0.05)],
                        valueFormat: d => d3.format('')(d)
                    }
                }
            };
        };

        service.getCitationsPerDocumentYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            return {
                title: 'Citations by document year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerDocumentYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#ff9933',
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    }
                }),
            };
        };

        service.getCitationsPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            return {
                title: 'Citations by year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#ff9933',
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    }
                }),
            };
        };

        service.getJournalMetricsPerYearLineChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);

            const totalIfPerYear = getItemsByYear(chartsData.totalIfPerYear, yearRange);
            const totalSjrPerYear = getItemsByYear(chartsData.totalSjrPerYear, yearRange);
            const totalSnipPerYear = getItemsByYear(chartsData.totalSnipPerYear, yearRange);

            const maxYValue = Math.max(parseFloat(_.maxBy(totalIfPerYear, 'value').value),
                parseFloat(_.maxBy(totalSjrPerYear, 'value').value),
                parseFloat(_.maxBy(totalSnipPerYear, 'value').value));
            const maxXValue = parseInt(_.maxBy(totalIfPerYear, 'year').year, 10);
            const minXValue = parseInt(_.minBy(totalIfPerYear, 'year').year, 10);

            const range = getRange(
                _.minBy(totalIfPerYear, 'year').year,
                _.maxBy(totalIfPerYear, 'year').year
            );

            return {
                title: 'Journal metrics by year',
                data: [{
                    key: 'IF',
                    values: totalIfPerYear
                }, {
                    key: 'SJR',
                    values: totalSjrPerYear
                }, {
                    key: 'SNIP',
                    values: totalSnipPerYear
                }],
                options: {
                    chart: {
                        type: 'lineChart',
                        color: (d, i) => metricsColors[i],
                        showLabels: true,
                        showLegend: true,
                        useInteractiveGuideline: true,
                        reduceXTicks: false,
                        duration: 300,
                        x: d => d.year,
                        y: d => d.value,
                        xAxis: {
                            axisLabel: '',
                            rotateLabels: 50,
                            showMaxMin: false,
                            tickValues: range,
                            tickFormat: d => d3.format('')(d)
                        },
                        yAxis: {
                            axisLabel: '',
                            axisLabelDistance: -10,
                            tickFormat: d => d3.format('.2f')(d)
                        },
                        yDomain: [0, maxYValue + (maxYValue * 0.05)],
                        xDomain: [minXValue, maxXValue + ((maxXValue - minXValue) * 0.05)],
                        valueFormat: d => d3.format('.2f')(d),
                    }
                }
            };
        };

        service.getJournalMetricsPerYearBarChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            return {
                title: 'Journal metrics by year',
                data: [{
                    key: 'IF',
                    values: getItemsByYear(chartsData.totalIfPerYear, yearRange)
                }, {
                    key: 'SJR',
                    values: getItemsByYear(chartsData.totalSjrPerYear, yearRange)
                }, {
                    key: 'SNIP',
                    values: getItemsByYear(chartsData.totalSnipPerYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    color: (d, i) => metricsColors[i],
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    },
                    valueFormat: d => d3.format('.2f')(d)
                }, {
                    tickFormat: d => d3.format('.2f')(d)
                })
            };
        };

        service.getFilteredDocumentsByYear = function (chartsData) {
            const yearRange = getYearRange(chartsData);
            const affiliatedDocuments = [];
            chartsData.filteredAffiliatedJournalsByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedConferencesByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedBooksByYear.forEach(getDataMerger(affiliatedDocuments));
            chartsData.filteredAffiliatedBookChaptersByYear.forEach(getDataMerger(affiliatedDocuments));
            const notAffiliatedDocuments = [];
            chartsData.filteredNotAffiliatedJournalsByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedConferencesByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedBooksByYear.forEach(getDataMerger(notAffiliatedDocuments));
            chartsData.filteredNotAffiliatedBookChaptersByYear.forEach(getDataMerger(notAffiliatedDocuments));

            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            return {
                title: 'IIT vs non-IIT documents',
                data: [{
                    key: 'IIT',
                    values: getItemsByYear(affiliatedDocuments, yearRange)
                }, {
                    key: 'non-IIT',
                    values: getItemsByYear(notAffiliatedDocuments, yearRange)
                }],
                options: getMultiBarChartConfig({
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    }
                }),
            };
        };

        service.getFilteredDocumentsSourceTypeByYear = function (chartsData) {
            const yearRange = getYearRange(chartsData);
            const filteredJournals = [];
            chartsData.filteredAffiliatedJournalsByYear.forEach(getDataMerger(filteredJournals));
            chartsData.filteredNotAffiliatedJournalsByYear.forEach(getDataMerger(filteredJournals));
            const filteredConferences = [];
            chartsData.filteredAffiliatedConferencesByYear.forEach(getDataMerger(filteredConferences));
            chartsData.filteredNotAffiliatedConferencesByYear.forEach(getDataMerger(filteredConferences));
            const filteredBooks = [];
            chartsData.filteredAffiliatedBooksByYear.forEach(getDataMerger(filteredBooks));
            chartsData.filteredNotAffiliatedBooksByYear.forEach(getDataMerger(filteredBooks));
            const filteredBookChapters = [];
            chartsData.filteredAffiliatedBookChaptersByYear.forEach(getDataMerger(filteredBookChapters));
            chartsData.filteredNotAffiliatedBookChaptersByYear.forEach(getDataMerger(filteredBookChapters));

            const range = getRange(
                yearRange.min,
                yearRange.max
            );

            return {
                title: 'Document by source type',
                data: [{
                    key: DocumentTypesService.getSourceTypeLabel('journal'),
                    values: getItemsByYear(filteredJournals, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('conference'),
                    values: getItemsByYear(filteredConferences, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('book'),
                    values: getItemsByYear(filteredBooks, yearRange)
                }, {
                    key: DocumentTypesService.getSourceTypeLabel('bookseries'),
                    values: getItemsByYear(filteredBookChapters, yearRange)
                }],
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: sourceTypesColors,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickValues: range,
                        tickFormat: d => d3.format('')(d)
                    }
                }),
            };
        };

        service.getTotalFilteredDocuments = function (chartsData) {
            return getTotal(chartsData, [
                'filteredAffiliatedJournalsByYear',
                'filteredAffiliatedConferencesByYear',
                'filteredAffiliatedBooksByYear',
                'filteredAffiliatedBookChaptersByYear',
                'filteredNotAffiliatedJournalsByYear',
                'filteredNotAffiliatedConferencesByYear',
                'filteredNotAffiliatedBooksByYear',
                'filteredNotAffiliatedBookChaptersByYear',
            ]);
        };

        service.getTotalFilteredJournals = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedJournalsByYear', 'filteredNotAffiliatedJournalsByYear']);
        };
        service.getTotalFilteredConferences = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedConferencesByYear', 'filteredNotAffiliatedConferencesByYear']);
        };
        service.getTotalFilteredBooks = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedBooksByYear', 'filteredNotAffiliatedBooksByYear']);
        };
        service.getTotalFilteredBookSeries = function (chartsData) {
            return getTotal(chartsData, ['filteredAffiliatedBookChaptersByYear', 'filteredNotAffiliatedBookChaptersByYear']);
        };

        service.getHindex = function (chartsData) {
            return chartsData.hindexPerYear.length ? chartsData.hindexPerYear[chartsData.hindexPerYear.length - 1].value : 0;
        };

        service.getTotalCitations = function (chartsData) {
            return getTotal(chartsData, ['citationsPerYear']);
        };

        service.getTotalImpactFactor = function (chartsData) {
            return getTotal(chartsData, ['totalIfPerYear']);
        };

        service.getDocumentTotals = (chartsData) => {
            let documentTotals = [
                {
                    title: 'Journals',
                    value: service.getTotalFilteredJournals(chartsData)
                },
                {
                    title: 'Conferences',
                    value: service.getTotalFilteredConferences(chartsData)
                },
                {
                    title: 'Books',
                    value: service.getTotalFilteredBooks(chartsData)
                },
                {
                    title: 'Book Series',
                    value: service.getTotalFilteredBookSeries(chartsData)
                },
            ];

            const baseOptions = {
                chart: {
                    type: 'pieChart',
                    x: d => d.type,
                    y: d => d.value,
                    labelThreshold: 0.02,
                    labelSunbeamLayout: true,
                    showLabels: false,
                    legendPosition: 'right'
                }
            };

            return {
                title: 'Document Totals',
                data: documentTotals.map(d => ({
                    type: d.title,
                    value: parseInt(d.value)
                })),
                options: baseOptions
            };
        };

        return service;

        // private
        function getDefaultOptions(options, defaults) {
            const newOptions = {};
            newOptions.chart = Object.assign({}, options.chart, _.cloneDeep(defaults.chart));
            newOptions.chart.margin = Object.assign({}, options.chart.margin, _.cloneDeep(defaults.chart.margin));
            newOptions.chart.xAxis = Object.assign({}, options.chart.xAxis, _.cloneDeep(defaults.chart.xAxis));
            newOptions.chart.yAxis = Object.assign({}, options.chart.yAxis, _.cloneDeep(defaults.chart.yAxis));
            return newOptions;
        }

        function getItemsByYear(data, yearRange) {
            const newData = data.map(d => ({
                year: parseInt(d.year, 10),
                value: parseFloat(d.value)
            })).filter(d => d.year >= yearRange.min);
            _.range(yearRange.min, yearRange.max + 1).forEach(y => {
                if (!_.find(newData, {year: y}))
                    newData.push({year: y, value: 0});
            });

            newData.sort((a, b) => a.year < b.year ? -1 : a.year > b.year ? 1 : 0);

            return newData;
        }


        function getYearRange(chartsData) {
            let flattenedData = [];

            flattenedData = flattenedData.concat(chartsData.journalsByYear);
            flattenedData = flattenedData.concat(chartsData.conferencesByYear);
            flattenedData = flattenedData.concat(chartsData.booksByYear);
            flattenedData = flattenedData.concat(chartsData.bookChaptersByYear);

            const years = flattenedData.map(v => parseInt(v.year, 10));
            const currentYear = new Date().getFullYear();

            return {
                min: _.isEmpty(years) ? currentYear : _.min(years),
                max: _.isEmpty(years) ? currentYear : Math.max(currentYear, _.max(years)),
            };
        }

        function getDataMerger(dataSet) {
            return function (d) {
                const value = parseInt(d.value, 10);
                const data = dataSet.find(d2 => d2.year === d.year);
                if (data)
                    data.value += value;
                else
                    dataSet.push({
                        year: d.year,
                        value: value
                    });
            };
        }

        function getMultiBarChartConfig(chartOptions = {}, yAxisOptions = {}) {
            return {
                chart: Object.assign({}, {
                    type: 'multiBarChart',
                    showLabels: true,
                    showLegend: true,
                    showValues: true,
                    stacked: false,
                    showControls: false,
                    //height: 420,
                    x: d => d.year,
                    y: d => d.value,
                    duration: 300,
                    reduceXTicks: true,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: Object.assign({
                        axisLabel: '',
                        axisLabelDistance: -10,
                        tickFormat: d => d3.format('')(d)
                    }, yAxisOptions),
                    valueFormat: d => d3.format('')(d)
                }, chartOptions)
            };
        }

        function getTotal(chartsData, dataNames) {
            let total = 0;
            dataNames.forEach(dn => total = chartsData[dn].reduce((total, d) => total + parseFloat(d.value), total));
            return total;
        }

        function getRange(minX, maxX) {
            let step = 1;

            const maxXValue = parseInt(maxX, 10);
            const minXValue = parseInt(minX, 10);

            switch(true) {
                case maxXValue - minXValue > 20:
                    step = 5;
                    break;
                case maxXValue - minXValue > 10:
                    step = 2;
                    break;
                default:
                    step = 1;
            }

            let range = d3.time.year.range(
                new Date(minX, 0),
                new Date(maxX, 0),
                step
            );

            return range.map(r => r.getFullYear());
        }
    }
}());
