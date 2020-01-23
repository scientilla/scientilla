/* global angular */
(function () {
        "use strict";

        angular.module('summary')
            .component('profileSummary', {
                templateUrl: 'partials/profile-summary.html',
                controller: ProfileSummaryComponent,
                controllerAs: 'vm'
            });

        ProfileSummaryComponent.$inject = [
            'context',
            '$scope',
            '$controller'
        ];

        function ProfileSummaryComponent(context, $scope, $controller) {
            const vm = this;
            angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
            angular.extend(vm, $controller('TabsController', {$scope: $scope}));

            vm.lastRefresh = new Date();
            vm.recalculating = false;

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;

            /* jshint ignore:start */
            vm.$onInit = () => {
                vm.subResearchEntity = context.getSubResearchEntity();

                const tabIdentifiers = [
                    {
                        index: 0,
                        slug: 'profile'
                    }, {
                        index: 1,
                        slug: 'profile-v2'
                    }, {
                        index: 2,
                        slug: 'documents-overview',
                        tabName: 'overview',
                        getData: getData
                    }, {
                        index: 3,
                        slug: 'bibliometric-charts',
                        tabName: 'metrics',
                        getData: getData
                    }, {
                        index: 4,
                        slug: 'calculated-data'
                    }
                ];

                vm.initializeTabs(tabIdentifiers);
            };

            async function recalculate() {
                vm.recalculating = true;
                vm.chartsData = await getData(true);
                vm.reloadTabs(vm.chartsData);
                vm.recalculating = false;
            }

            async function getData(refresh  = false) {
                if (!isMainGroup()) {
                    refresh = true;
                }

                const chartsData = await vm.getChartsData(vm.subResearchEntity, refresh);

                if (chartsData.chartDataDate && chartsData.chartDataDate[0].max) {
                    vm.lastRefresh = new Date(chartsData.chartDataDate[0].max);
                }

                return chartsData;
            }
            /* jshint ignore:end */

            function isMainGroup() {
                return vm.subResearchEntity.id === 1;
            }
        }
    }

)();