/* global angular */
(function () {
    angular
        .module('groups')
        .component('scientillaGroupDetails', {
            controller: GroupDetailsController,
            templateUrl: 'partials/scientilla-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupId: '<',
                activeTab: '@?'
            }
        });

    GroupDetailsController.$inject = [
        'GroupsService',
        'context',
        'AuthService',
        '$scope',
        '$controller',
        'ResearchEntitiesService',
        '$timeout'
    ];

    function GroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService,
        $timeout
    ) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;

        let activeTabWatcher = null;

        /* jshint ignore:start */
        vm.$onInit = async function () {

            activeTabWatcher = $scope.$watch('vm.activeTabIndex', () => {
                if (vm.activeTabIndex === 5) {
                    $timeout(function () {
                        $scope.$broadcast('rzSliderForceRender');
                    });
                }
            });

            await refreshGroup();

            const tabIdentifiers = [
                {
                    index: 0,
                    slug: 'info',
                    tabName: 'group-info'
                }, {
                    index: 1,
                    slug: 'members',
                    tabName: 'group-members'
                }, {
                    index: 2,
                    slug: 'child-groups'
                }, {
                    index: 3,
                    slug: 'documents'
                }, {
                    index: 4,
                    slug: 'accomplishments'
                }, {
                    index: 5,
                    slug: 'projects'
                }, {
                    index: 6,
                    slug: 'documents-overview',
                    tabName: 'overview',
                    getData: getData
                }, {
                    index: 7,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                    getData: getData
                }
            ];

            vm.initializeTabs(tabIdentifiers);
        };

        vm.$onDestroy = function () {
            activeTabWatcher();
        };

        async function getData() {
            return await vm.getChartsData(vm.group);
        }

        function refreshGroup() {
            return GroupsService.getGroup(vm.groupId)
                .then(async (group) => {
                    vm.group = group;
                    vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);
                });
        }

        /* jshint ignore:end */

        vm.isAdmin = function () {
            return vm.loggedUser && vm.loggedUser.isAdmin();
        };

        vm.isScientific = function () {
            if (!vm.group)
                return true;
            return ['Institute', 'Center', 'Research Line', 'Facility'].includes(vm.group.type);
        };
    }
})();
