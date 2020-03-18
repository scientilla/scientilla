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
            'EventsService',
            '$location'
        ];

        function ProfileSummaryComponent(context, $scope, $controller, UsersService, AuthService, EventsService, $location) {
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
                    slug: 'documents-overview',
                    tabName: 'overview',
                }, {
                    index: 2,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                }, {
                    index: 3,
                    slug: 'calculated-data'
                }
            ];

            vm.activeTabIndex = 0;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                vm.subResearchEntity = context.getSubResearchEntity();

                if (vm.subResearchEntity.getType() === 'user') {
                    EventsService.subscribeAll(vm, [
                        EventsService.USER_PROFILE_CHANGED,
                    ], (evt, profile) => {
                        vm.profile = profile;
                    });

                    getProfile().then(profile => {
                        vm.profile = profile;
                    }, () => {
                        $location.url('/dashboard/documents-overview');
                    }).finally(async () => {
                        if (!vm.profile) {
                            tabIdentifiers = tabIdentifiers.filter(identifier => {
                                return identifier.index !== 0;
                            });
                        }

                        vm.initializeTabs(tabIdentifiers);
                        vm.chartsData = await getData();
                        vm.reloadTabs(vm.chartsData);
                    });
                } else {
                    if (!vm.isMainGroup()) {
                        tabIdentifiers = tabIdentifiers.filter(identifier => {
                            return identifier.index !== 3;
                        });
                    }

                    vm.initializeTabs(tabIdentifiers);
                    vm.chartsData = await getData();
                    vm.reloadTabs(vm.chartsData);
                }
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
                        if (profile) {
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