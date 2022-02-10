(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryProjectsTechnologyTransfer', {
            templateUrl: 'partials/summary-projects-technology-transfer.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = [
        'ChartService',
        '$timeout',
        '$element'
    ];

    function controller(ChartService, $timeout, $element) {
        const vm = this;

        vm.name = 'summary-projects-technology-transfer';
        vm.shouldBeReloaded = true;

        vm.charts = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.getData = async () => {
            return await ChartService.getProjectsAndPatentsChartData(vm.researchEntity);
        }
        /* jshint ignore:end */

        vm.reload = chartsData => {
            vm.charts = {};

            $timeout(() => {
                vm.charts.patentsByYear = ChartService.getPatentsByYear(chartsData) || false;
                vm.charts.projectAnnualContributionsByYear = ChartService.getProjectAnnualContributionsByYear(chartsData) || false;
                vm.charts.projectTotalContributionsByYear = ChartService.getProjectTotalContributionsByYear(chartsData) || false;

                vm.projectCharts = [];
                if (vm.charts.projectAnnualContributionsByYear) {
                    vm.projectCharts.push({
                        icon: 'fas fa-chart-bar',
                        chartSettings: vm.charts.projectAnnualContributionsByYear,
                        default: true,
                        title: vm.charts.projectAnnualContributionsByYear.title
                    });
                }

                if ( vm.charts.projectTotalContributionsByYear) {
                    vm.projectCharts.push({
                        icon: 'fas fa-chart-bar',
                        chartSettings: vm.charts.projectTotalContributionsByYear,
                        title: vm.charts.projectTotalContributionsByYear.title
                    });
                }
            });
        };

    }
})();
