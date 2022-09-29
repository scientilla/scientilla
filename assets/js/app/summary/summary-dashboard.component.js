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
            'context',
            'AuthService',
            'groupTypes',
            'GroupsService'
        ];

        function controller(
            $scope,
            $controller,
            context,
            AuthService,
            groupTypes,
            GroupsService
        ) {
            const vm = this;

            angular.extend(vm, $controller('TabsController', {$scope: $scope}));

            vm.activeTabIndex = 0;

            vm.tabIdentifiers = [
                {
                    index: 0,
                    slug: 'document-charts',
                    tabName: 'summary-overview',
                }, {
                    index: 1,
                    slug: 'metric-charts',
                    tabName: 'summary-metrics',
                }, {
                    index: 2,
                    slug: 'projects-and-technology-transfer',
                    tabName: 'summary-projects-technology-transfer',
                }, {
                    index: 3,
                    slug: 'scientific-production',
                    tabName: 'scientific-production',

                }
            ];

            vm.loggedUser = AuthService.user;
            vm.group = false;

            vm.isSuperUser = function () {
                return vm.loggedUser && vm.loggedUser.isSuperUser();
            };

            vm.isGroupAdmin = function () {
                return GroupsService.isGroupAdmin(vm.group, vm.loggedUser);
            };

            vm.showScientificProduction = function () {
                if (!vm.group)
                    return false;
                return [
                    groupTypes.INSTITUTE,
                    groupTypes.CENTER,
                    groupTypes.RESEARCH_LINE,
                    groupTypes.FACILITY
                ].includes(vm.group.type);
            };

            /* jshint ignore:start */
            vm.$onInit = async () => {
                vm.subResearchEntity = context.getSubResearchEntity();
                if (vm.subResearchEntity.getType() === 'group') {
                    vm.group = await GroupsService.getGroup(vm.subResearchEntity.id);
                }

                vm.initializeTabs(vm.tabIdentifiers);
            };
            /* jshint ignore:end */
        }
    }
)();
