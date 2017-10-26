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

        vm.documentsByYear = {};
        vm.documentsByType = {};
        vm.invitedTalksByYear = {};

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
                    axisLabel: ''
                },
                yAxis: {
                    axisLabel: ''
                }
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
                reduceXTicks: false
            }
        };


        vm.documentsByYear.title = 'Documents by year';
        vm.documentsByYear.data = [];
        vm.documentsByYear.baseOptions = {
            chart: {
                type: 'multiBarChart',
                x: d => d.year,
                y: d => d.count,
                showValues: true,
                stacked: true,
                xAxis: {
                    axisLabel: 'Year',
                    rotateLabels: 50,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: '# documents',
                    axisLabelDistance: -10
                }
            }
        };


        vm.invitedTalksByYear.title = 'Invited talks by year';
        vm.invitedTalksByYear.data = [];
        vm.invitedTalksByYear.baseOptions = {
            chart: {
                type: 'multiBarChart',
                x: d => d.year,
                y: d => d.count,
                showValues: true,
                xAxis: {
                    axisLabel: 'Year',
                    rotateLabels: 50,
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: '# invited talks',
                    axisLabelDistance: -10
                }
            }
        };

        vm.documentsByType.title = 'Documents by Type';
        vm.documentsByType.data = [];
        vm.documentsByType.baseOptions = {
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
            const charts = ['ConferencesByYear', 'ArticlesByYear', 'BooksByYear', 'BookChaptersByYear', 'InvitedTalksByYear', 'DocumentsByType'];
            const chartsData = await vm.researchEntity.all('charts').getList({charts: charts});

            const yearRange = getYearRange(chartsData);

            vm.documentsByYear.data.push({
                key: 'Journal',
                values: getDocumentsByYear(chartsData[1], yearRange)
            });
            vm.documentsByYear.data.push({
                key: 'Conference',
                values: getDocumentsByYear(chartsData[1], yearRange)
            });
            vm.documentsByYear.data.push({
                key: "Book",
                values: getDocumentsByYear(chartsData[2], yearRange)
            });
            vm.documentsByYear.data.push({
                key: 'Book Chapter',
                values: getDocumentsByYear(chartsData[3], yearRange)
            });

            vm.documentsByYear.options = getDefaultOptions(vm.documentsByYear.baseOptions, previewDefaultOptions);

            vm.invitedTalksByYear.data.push({
                key: 'Invited talk',
                values: getDocumentsByYear(chartsData[4], yearRange)
            });
            vm.invitedTalksByYear.options = getDefaultOptions(vm.invitedTalksByYear.baseOptions, previewDefaultOptions);


            vm.documentsByType.data = chartsData[5].map(d => ({
                type: DocumentTypesService.getDocumentTypeLabel(d.type),
                count: parseInt(d.count)
            }));
            vm.documentsByType.options = getDefaultOptions(vm.documentsByType.baseOptions, previewDefaultOptions);

            changeChart(vm.documentsByYear);

        };

        /* jshint ignore:end */

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

        function changeChart(chart) {
            vm.mainChart = _.cloneDeep(chart);
            vm.mainChart.options = getDefaultOptions(vm.mainChart.baseOptions, mainChartDefaultOptions);
        }

        function getDefaultOptions(options, defaults) {
            const newOptions = {};
            newOptions.chart = Object.assign({}, options.chart, _.cloneDeep(defaults.chart));
            return newOptions;

        }
    }
})();