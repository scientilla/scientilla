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
        '$timeout',
        'ModalService'
    ];

    function GroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService,
        $timeout,
        ModalService
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;
        vm.addCollaborator = addCollaborator;

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
                    slug: 'patents'
                }, {
                    index: 7,
                    slug: 'documents-overview',
                    tabName: 'overview-tab'
                }, {
                    index: 8,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics-tab'
                }
            ];

            vm.initializeTabs(tabIdentifiers);
        };

        vm.$onDestroy = function () {
            activeTabWatcher();
        };

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

        vm.isGroupAdmin = function () {
            return AuthService.isAdmin;
        };

        vm.isScientific = function () {
            if (!vm.group)
                return true;
            return ['Institute', 'Center', 'Research Line', 'Facility'].includes(vm.group.type);
        };

        function addCollaborator() {
            ModalService.openCollaboratorForm(vm.group)
                .then(() => {
                    if (vm.activeTabIndex === 1) {
                        $scope.$broadcast('refreshList');
                    }
                });
        }
    }
})();
