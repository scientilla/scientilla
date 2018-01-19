/* global d3 */
(function () {
    "use strict";
    angular.module("services").factory("ChartService", ChartService);

    ChartService.$inject = [
        'DocumentTypesService'
    ];


    function ChartService(DocumentTypesService) {
        const service = {
            previewDefaultOptions: {
                chart: {
                    showLabels: false,
                    showLegend: false,
                    showControls: false,
                    width: undefined,
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
                    width: undefined,
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
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
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
                title: 'h index by year',
                data: [{
                    key: 'h-index',
                    values: getItemsByYear(chartsData.hindexPerYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getCitationsPerDocumentYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
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
                title: 'Citations per document year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerDocumentYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getCitationsPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
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
                title: 'Citations by year',
                data: [{
                    key: 'Citations',
                    values: getItemsByYear(chartsData.citationsPerYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
            };
        };

        service.getCitationsTotaIfPerYear = (chartsData) => {
            const yearRange = getYearRange(chartsData);
            const baseOptions = {
                chart: {
                    type: 'multiBarChart',
                    x: d => d.year,
                    y: d => d.value,
                    showValues: true,
                    stacked: true,
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
                title: 'Total impact factor by year',
                data: [{
                    key: 'Impact factor',
                    values: getItemsByYear(chartsData.totaIfPerYear, yearRange)
                }],
                options: getDefaultOptions(baseOptions, service.previewDefaultOptions),
                baseOptions: baseOptions
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
            }));
            _.range(yearRange.min, yearRange.max + 1).forEach(y => {
                if (!_.find(newData, {year: y}))
                    newData.push({value: 0, year: y});
            });

            newData.sort((a, b) => a.year < b.year ? -1 : a.year > b.year ? 1 : 0);

            return newData;
        }


        function getYearRange(cd) {
            let flattenedData = [];
            for (const key in cd)
                if (_.isArray(cd[key]))
                    flattenedData = flattenedData.concat(cd[key]);

            const years = flattenedData.map(v => parseInt(v.year, 10));
            const currentYear = new Date().getFullYear();

            return {
                min: _.isEmpty(years) ? currentYear : _.min(years),
                max: _.isEmpty(years) ? currentYear : _.max(years)
            };
        }
    }
}());
