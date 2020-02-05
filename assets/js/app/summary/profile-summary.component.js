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
            '$controller',
            'UsersService',
            'AuthService',
            'EventsService'
        ];

        function ProfileSummaryComponent(context, $scope, $controller, UsersService, AuthService, EventsService) {
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
                    slug: 'profile'
                }, {
                    index: 1,
                    slug: 'profile-v2'
                }, {
                    index: 2,
                    slug: 'documents-overview',
                    tabName: 'overview',
                }, {
                    index: 3,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                }, {
                    index: 4,
                    slug: 'calculated-data'
                }
            ];

            vm.activeTabIndex = 0;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                getProfile().then(profile => {
                    vm.profile = profile;
                }, () => {
                    tabIdentifiers = tabIdentifiers.filter(identifier => {
                        return identifier.index !== 0 && identifier.index !== 1;
                    });
                    vm.activeTabIndex = 2;
                }).finally(async () => {
                    vm.initializeTabs(tabIdentifiers);
                    vm.chartsData = await getData();
                    vm.reloadTabs(vm.chartsData);
                });

                vm.subResearchEntity = context.getSubResearchEntity();

                EventsService.subscribeAll(vm, [
                    EventsService.USER_PROFILE_CHANGED,
                ], (evt, profile) => {
                    vm.profile = profile;
                });
            };

            vm.$onDestroy = () => {
                EventsService.unsubscribeAll(vm);
            };

            async function recalculate() {
                vm.recalculating = true;
                vm.chartsData = await getData(true);
                vm.reloadTabs(vm.chartsData);
                vm.recalculating = false;
            }

            async function getData(refresh = false) {
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

            function getProfile() {
                return new Promise((resolve, reject) => {
                    UsersService.getProfile(AuthService.user.researchEntity).then(profile => {
                        if (profile !== false) {
                            resolve(profile);
                        } else {
                            reject();
                        }
                    });
                });
            }
        }
    }

)();