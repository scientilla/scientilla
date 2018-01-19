(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryMetrics', {
            templateUrl: 'partials/summary-metrics.html',
            controller: SummaryMetricsComponent,
            controllerAs: 'vm',
            bindings: {
                chartsData: '<'
            },
            require: {
                profileSummary: '^profileSummary'
            }
        });

    SummaryMetricsComponent.$inject = [
        'ChartService'
    ];

    function SummaryMetricsComponent(ChartService) {
        const vm = this;
        vm.changeChart = changeChart;
        vm.isChartSelected = isChartSelected;

        vm.name = 'metrics';
        vm.charts = [];

        vm.$onInit = () => {
            vm.profileSummary.registerTab(vm);
            vm.reload(vm.chartsData);
        };

        vm.reload = (chartsData) => {
            vm.charts = [];
            vm.mainChart = undefined;
            vm.charts.push(ChartService.getHindexPerYear(chartsData));
            vm.charts.push(ChartService.getCitationsPerDocumentYear(chartsData));
            vm.charts.push(ChartService.getCitationsPerYear(chartsData));
            vm.charts.push(ChartService.getCitationsTotaIfPerYear(chartsData));
            changeChart(vm.charts[0]);

        };


        function changeChart(chart) {
            vm.mainChart = ChartService.getAsMainChart(chart);
        }

        function isChartSelected(chart) {
            if (!vm.mainChart) return false;
            return chart.title === vm.mainChart.title;
        }
    }
})();