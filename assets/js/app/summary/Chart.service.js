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
        '#980181', // book
        '#753198' // book series
    ];

    function ChartService(DocumentTypesService) {
        const service = {
            previewDefaultOptions: {
                chart: {
                    showLabels: false,
                    showLegend: false,
                    showControls: false,
                    height: 250,
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
                    height: 420,
                    margin: {
                        top: 40,
                        right: 20,
                        bottom: 65,
                        left: 50
                    },
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

        service.getDocumentsByType = (chartsData) => {
            const baseOptions = {
                chart: {
                    type: 'pieChart',
                    x: d => d.type,
                    y: d => d.value,
                    labelThreshold: 0.02,
                    labelSunbeamLayout: true,
                    legend: {
                        margin: {
                            top: 5,
                            right: 35,
                            bottom: 5,
                            left: 0
                        }
                    }
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
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false
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
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
                    color: sourceTypesColors,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false
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
            let maxYValue, maxXValue, minXValue;
            if (chartsData.hindexPerYear.length) {
                maxYValue = parseInt(_.maxBy(chartsData.hindexPerYear, 'value').value, 10);
                maxXValue = parseInt(_.maxBy(chartsData.hindexPerYear, 'year').year, 10);
                minXValue = parseInt(_.minBy(chartsData.hindexPerYear, 'year').year, 10);
            }
            else {
                maxYValue = 1;
                maxXValue = yearRange.max;
                minXValue = yearRange.min;
            }
            return {
                title: 'h-index by year',
                data: [{
                    key: 'h-index',
                    values: getItemsByYear(chartsData.hindexPerYear, yearRange)
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
                        height: 300,
                        xAxis: {
                            rotateLabels: 50,
                            showMaxMin: false,
                            ticks: Math.min(maxXValue - minXValue, 10),
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

            return {
                title: 'Citations by document year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerDocumentYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#ff9933',
                }),
            };
        };

        service.getCitationsPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            return {
                title: 'Citations by year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerYear, yearRange)
                }],
                options: getMultiBarChartConfig({
                    stacked: true,
                    color: () => '#ff9933',
                }),
            };
        };

        service.getJournalMetricsPerYearLineChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            let maxYValue, maxXValue, minXValue;
            if (chartsData.totalIfPerYear.length) {
                const maxIf = parseInt(_.maxBy(chartsData.totalIfPerYear, 'value').value, 10);
                const maxSjr = parseInt(_.maxBy(chartsData.totalSjrPerYear, 'value').value, 10);
                const maxSnip = parseInt(_.maxBy(chartsData.totalSnipPerYear, 'value').value, 10);
                maxYValue = Math.max(maxIf, maxSjr, maxSnip);
                maxXValue = parseInt(_.maxBy(chartsData.totalIfPerYear, 'year').year, 10);
                minXValue = parseInt(_.minBy(chartsData.totalIfPerYear, 'year').year, 10);
            }
            else {
                maxYValue = 1;
                maxXValue = yearRange.max;
                minXValue = yearRange.min;
            }
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
                options: {
                    chart: {
                        type: 'lineChart',
                        color: (d, i) => metricsColors[i],
                        showLabels: true,
                        showLegend: true,
                        useInteractiveGuideline: true,
                        height: 420,
                        duration: 300,
                        x: d => d.year,
                        y: d => d.value,
                        xAxis: {
                            axisLabel: '',
                            rotateLabels: 50,
                            showMaxMin: false,
                            ticks: Math.min(maxXValue - minXValue, 10),
                            tickFormat: d => d3.format('')(d)
                        },
                        yAxis: {
                            axisLabel: '',
                            axisLabelDistance: -10,
                            tickFormat: d => d3.format('')(d)
                        },
                        yDomain: [0, maxYValue + (maxYValue * 0.05)],
                        xDomain: [minXValue, maxXValue + ((maxXValue - minXValue) * 0.05)],
                        valueFormat: d => d3.format('')(d),
                    }
                }
            };
        };

        service.getJournalMetricsPerYearBarChart = (chartsData) => {
            const yearRange = getYearRange(chartsData);
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
                options: getMultiBarChartConfig({color: (d, i) => metricsColors[i]})
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

            return {
                title: 'IIT vs non-IIT documents',
                data: [{
                    key: 'IIT',
                    values: getItemsByYear(affiliatedDocuments, yearRange)
                }, {
                    key: 'non-IIT',
                    values: getItemsByYear(notAffiliatedDocuments, yearRange)
                }],
                options: getMultiBarChartConfig(),
            };
        };

        service.getFilteredDocumentsTypeByYear = function (chartsData) {
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
                    color: sourceTypesColors
                }),
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
                value: parseInt(d.value, 10)
            })).filter(d => d.year >= yearRange.min);
            _.range(yearRange.min, yearRange.max + 1).forEach(y => {
                if (!_.find(newData, {year: y}))
                    newData.push({value: 0, year: y});
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
                max: currentYear
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

        function getMultiBarChartConfig(chartOptions) {
            return {
                chart: Object.assign({}, {
                    type: 'multiBarChart',
                    showLabels: true,
                    showLegend: true,
                    showValues: true,
                    stacked: false,
                    showControls: false,
                    height: 420,
                    x: d => d.year,
                    y: d => d.value,
                    duration: 300,
                    reduceXTicks: false,
                    xAxis: {
                        axisLabel: '',
                        rotateLabels: 50,
                        showMaxMin: false,
                        tickFormat: d => d3.format('')(d)
                    },
                    yAxis: {
                        axisLabel: '',
                        axisLabelDistance: -10,
                        tickFormat: d => d3.format('')(d)
                    },
                    valueFormat: d => d3.format('')(d)
                }, chartOptions)
            };
        }
    }
}());
