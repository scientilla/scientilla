(function () {
    "use strict";

    angular
        .module('documents')
        .component('profileSummary', {
            templateUrl: 'partials/profile-summary.html',
            controller: ProfileSummaryComponent,
            controllerAs: 'vm'
        });

    ProfileSummaryComponent.$inject = [
        'context',
        'DocumentTypesService'
    ];

    function ProfileSummaryComponent(context, DocumentTypesService) {
        const vm = this;
        vm.researchEntity = context.getResearchEntity();
        vm.changeChart = changeChart;
        vm.isChartSelected = isChartSelected;

        vm.charts = [];
        vm.charts[0] = {};
        vm.charts[1] = {};
        vm.charts[2] = {};

        const previewDefaultOptions = {
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
        };
        const mainChartDefaultOptions = {
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
        };


        vm.charts[0].title = 'Documents by year';
        vm.charts[0].data = [];
        vm.charts[0].baseOptions = {
            chart: {
                type: 'multiBarChart',
                x: d => d.year,
                y: d => d.count,
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


        vm.charts[1].title = 'Invited talks by year';
        vm.charts[1].data = [];
        vm.charts[1].baseOptions = {
            chart: {
                type: 'multiBarChart',
                x: d => d.year,
                y: d => d.count,
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

        vm.charts[2].title = 'Documents by Type';
        vm.charts[2].data = [];
        vm.charts[2].baseOptions = {
            chart: {
                type: 'pieChart',
                x: function (d) {
                    return d.type;
                },
                y: function (d) {
                    return d.count;
                },
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

        /* jshint ignore:start */
        vm.$onInit = async () => {
            const queryes = {
                ArticlesByYear: 0,
                ConferencesByYear: 1,
                BooksByYear: 2,
                BookChaptersByYear: 3,
                DisseminationTalksByYear: 4,
                ScientificTalksByYear: 5,
                DocumentsByType: 6
            };
            const chartsData = await vm.researchEntity.all('charts').getList({charts: Object.keys(queryes)});

            const yearRange = getYearRange(chartsData);

            vm.charts[0].data.push({
                key: DocumentTypesService.getSourceTypeLabel('journal'),
                values: getDocumentsByYear(chartsData[queryes.ArticlesByYear], yearRange)
            });
            vm.charts[0].data.push({
                key: DocumentTypesService.getSourceTypeLabel('conference'),
                values: getDocumentsByYear(chartsData[queryes.ConferencesByYear], yearRange)
            });
            vm.charts[0].data.push({
                key: DocumentTypesService.getSourceTypeLabel('book'),
                values: getDocumentsByYear(chartsData[queryes.BooksByYear], yearRange)
            });
            vm.charts[0].data.push({
                key: DocumentTypesService.getSourceTypeLabel('bookseries'),
                values: getDocumentsByYear(chartsData[queryes.BookChaptersByYear], yearRange)
            });

            vm.charts[0].options = getDefaultOptions(vm.charts[0].baseOptions, previewDefaultOptions);

            vm.charts[1].data.push({
                key: 'Dissemination',
                values: getDocumentsByYear(chartsData[queryes.DisseminationTalksByYear], yearRange)
            });
            vm.charts[1].data.push({
                key: 'Scientific Event',
                values: getDocumentsByYear(chartsData[queryes.ScientificTalksByYear], yearRange)
            });
            vm.charts[1].options = getDefaultOptions(vm.charts[1].baseOptions, previewDefaultOptions);


            vm.charts[2].data = chartsData[queryes.DocumentsByType].map(d => ({
                type: DocumentTypesService.getDocumentTypeLabel(d.type),
                count: parseInt(d.count)
            }));
            vm.charts[2].options = getDefaultOptions(vm.charts[2].baseOptions, previewDefaultOptions);

            changeChart(vm.charts[0]);

        };

        /* jshint ignore:end */


        function changeChart(chart) {
            vm.mainChart = _.cloneDeep(chart);
            vm.mainChart.options = getDefaultOptions(vm.mainChart.baseOptions, mainChartDefaultOptions);
        }

        function isChartSelected(chart) {
            if (!vm.mainChart) return false;
            return chart.title === vm.mainChart.title;
        }

        function getYearRange(chartsData) {
            const years = _.flatten(chartsData).map(v => parseInt(v.year, 10));

            return {
                min: _.isEmpty(years) ? 0 : _.min(years),
                max: _.isEmpty(years) ? 0 : _.max(years)
            };
        }

        function getDocumentsByYear(data, yearRange) {
            const newData = data.map(d => ({
                year: parseInt(d.year, 10),
                count: parseInt(d.count, 10)
            }));
            for (let y = yearRange.min; y <= yearRange.max; y++) {
                if (!_.find(newData, {year: y}))
                    newData.push({count: 0, year: y});
            }

            newData.sort((a, b) => a.year < b.year ? -1 : a.year > b.year ? 1 : 0);

            return newData;
        }

        function getDefaultOptions(options, defaults) {
            const newOptions = {};
            newOptions.chart = Object.assign({}, options.chart, _.cloneDeep(defaults.chart));
            newOptions.chart.margin = Object.assign({}, options.chart.margin, _.cloneDeep(defaults.chart.margin));
            newOptions.chart.xAxis = Object.assign({}, options.chart.xAxis, _.cloneDeep(defaults.chart.xAxis));
            newOptions.chart.yAxis = Object.assign({}, options.chart.yAxis, _.cloneDeep(defaults.chart.yAxis));
            return newOptions;

        }
    }
})();