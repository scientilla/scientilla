/* global angular */
(function () {
        "use strict";

        angular.module('summary')
            .component('summaryDashboard', {
                templateUrl: 'partials/summary-dashboard.html',
                controller,
                controllerAs: 'vm'
            });

        controller.$inject = [
            'context',
            'ChartService'
        ];

        function controller(
            context,
            ChartService
        ) {
            const vm = this;

            vm.lastRefresh = new Date();
            vm.recalculating = false;
            vm.chartsData = {};

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;

            vm.profile = false;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                vm.subResearchEntity = context.getSubResearchEntity();

                const refresh = !isMainGroup();

                vm.documentOverviewChartData = await ChartService.getDocumentsOverviewChartData(vm.subResearchEntity, refresh);
                vm.bibliometricChartData = await ChartService.getBibliometricChartData(vm.subResearchEntity, refresh);

                if (vm.bibliometricChartData.chartDataDate && vm.bibliometricChartData.chartDataDate[0].max) {
                    vm.lastRefresh = new Date(vm.bibliometricChartData.chartDataDate[0].max);
                }

            };

            async function recalculate() {
                if (vm.recalculating)
                    return;

                vm.recalculating = true;

                const refresh = !isMainGroup();

                vm.chartsData = await ChartService.getData(vm.subResearchEntity, refresh);

                if (vm.chartsData.chartDataDate && vm.chartsData.chartDataDate[0].max) {
                    vm.lastRefresh = new Date(vm.chartsData.chartDataDate[0].max);
                }
                vm.recalculating = false;
            }
            /* jshint ignore:end */

            function isMainGroup() {
                return vm.subResearchEntity.id === 1;
            }
        }
    }

)();