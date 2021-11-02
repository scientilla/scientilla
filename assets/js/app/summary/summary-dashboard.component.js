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
            '$scope',
            '$controller',
            'context'
        ];

        function controller(
            $scope,
            $controller,
            context
        ) {
            const vm = this;

            angular.extend(vm, $controller('TabsController', {$scope: $scope}));

            vm.activeTabIndex = 0;

            vm.tabIdentifiers = [
                {
                    index: 0,
                    slug: 'document-charts',
                    tabName: 'overview',
                }, {
                    index: 1,
                    slug: 'metric-charts',
                    tabName: 'metrics',
                }, {
                    index: 2,
                    slug: 'projects-and-technology-transfer',
                    tabName: 'projectsTechnologyTransfer',
                }
            ];

            vm.$onInit = () => {
                vm.subResearchEntity = context.getSubResearchEntity();

                vm.initializeTabs(vm.tabIdentifiers);
            };
        }
    }
)();
