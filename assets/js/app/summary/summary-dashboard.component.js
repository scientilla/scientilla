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
                vm.chartsData = await ChartService.getData(vm.subResearchEntity);
            };

            async function recalculate() {
                if (vm.recalculating)
                    return;

                vm.recalculating = true;
                vm.chartsData = await ChartService.getData(vm.subResearchEntity, true);

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