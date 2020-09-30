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
            '$scope',
            '$controller'
        ];

        function controller(
            context,
            $scope,
            $controller
        ) {
            const vm = this;
            angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));

            vm.lastRefresh = new Date();
            vm.recalculating = false;
            vm.chartsData = {};

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;

            vm.profile = false;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                vm.subResearchEntity = context.getSubResearchEntity();
                await recalculate();
            };

            async function recalculate() {
                if (vm.recalculating)
                    return;

                vm.recalculating = true;
                const refresh = !isMainGroup();
                vm.chartsData = await vm.getChartsData(vm.subResearchEntity, refresh);

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