(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryOverview', {
            templateUrl: 'partials/summary-overview.html',
            controller: SummaryOverviewComponent,
            controllerAs: 'vm',
            bindings: {
                chartsData: '<'
            },
            require: {
                profileSummary: '^profileSummary'
            }
        });

    SummaryOverviewComponent.$inject = [
        'ChartService',
        'ModalService'
    ];

    function SummaryOverviewComponent(ChartService, ModalService) {
        const vm = this;
        vm.changeChart = changeChart;
        vm.isChartSelected = isChartSelected;
        vm.showInfo = showInfo;

        vm.name = 'overview';
        vm.charts = [];

        vm.$onInit = () => {
            vm.profileSummary.registerTab(vm);
            vm.reload(vm.chartsData);
        };

        vm.$onDestroy = () => {
            vm.profileSummary.unregisterTab(vm);
        };

        vm.reload = (chartsData) => {
            vm.charts = [];
            vm.mainChart = undefined;
            vm.charts.push(ChartService.getDocumentsByYear(chartsData));
            vm.charts.push(ChartService.getInvitedTalksByYear(chartsData));
            vm.charts.push(ChartService.getDocumentsByType(chartsData));
            changeChart(vm.charts[0]);
        };


        function changeChart(chart) {
            vm.mainChart = ChartService.getAsMainChart(chart);
        }

        function isChartSelected(chart) {
            if (!vm.mainChart) return false;
            return chart.title === vm.mainChart.title;
        }

        function showInfo(){
            ModalService.openWizard(['summary-overview'], true);
        }
    }
})();