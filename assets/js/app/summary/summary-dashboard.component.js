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
            '$controller',
            'UsersService',
            'AuthService',
            'EventsService',
            '$location'
        ];

        function controller(
            context,
            $scope,
            $controller,
            UsersService,
            AuthService,
            EventsService,
            $location
        ) {
            const vm = this;
            angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
            angular.extend(vm, $controller('TabsController', {$scope: $scope}));

            vm.lastRefresh = new Date();
            vm.recalculating = false;
            vm.chartsData = {};

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;

            vm.profile = false;

            let tabIdentifiers = [
                {
                    index: 0,
                    slug: 'documents-overview',
                    tabName: 'overview',
                }, {
                    index: 1,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                }, {
                    index: 2,
                    slug: 'calculated-data'
                }
            ];

            vm.activeTabIndex = 0;

            let deregister = null;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                EventsService.subscribeAll(vm, [
                    EventsService.USER_PROFILE_CHANGED,
                ], (evt, profile) => {
                    vm.profile = profile;
                });

                deregister = $scope.$watch('vm.subResearchEntity.config.scientific', async () => {
                    vm.initializeTabs(tabIdentifiers);
                    await vm.recalculate();
                });

                vm.subResearchEntity = context.getSubResearchEntity();

                if (vm.subResearchEntity.getType() === 'user') {
                    vm.profile = await getProfile();

                } else {
                    if (!vm.isMainGroup()) {
                        tabIdentifiers = tabIdentifiers.filter(identifier => {
                            return identifier.index !== 3;
                        });
                    }
                }

                if (vm.subResearchEntity.isScientific()) {
                    vm.initializeTabs(tabIdentifiers);
                    await vm.recalculate();
                }
            };

            vm.$onDestroy = () => {
                EventsService.unsubscribeAll(vm);

                deregister();
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
                vm.reloadTabs(vm.chartsData);
                vm.recalculating = false;
            }

            /* jshint ignore:end */

            function isMainGroup() {
                return vm.subResearchEntity.id === 1;
            }

            /* jshint ignore:start */
            async function getProfile() {
                return UsersService.getProfile(AuthService.user.researchEntity);
            }

            /* jshint ignore:end */
        }
    }

)();