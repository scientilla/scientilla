/* global angular */
(function () {
    angular
        .module('groups')
        .component('defaultGroupDetails', {
            controller: DefaultGroupDetailsController,
            templateUrl: 'partials/default-group-details.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                tabs: '<',
                activeTab: '@?'
            }
        });

    DefaultGroupDetailsController.$inject = [
        'GroupsService',
        'context',
        'AuthService',
        '$scope',
        '$controller',
        'ResearchEntitiesService',
        '$timeout',
        'ModalService',
        'groupTypes'
    ];

    function DefaultGroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService,
        $timeout,
        ModalService,
        groupTypes
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

            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            vm.initializeTabs(vm.tabs);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            activeTabWatcher();
        };

        /* jshint ignore:start */
        async function refreshGroup() {
            vm.group = await GroupsService.getGroup(vm.group.id);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);
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
            return [
                groupTypes.INSTITUTE,
                groupTypes.CENTER,
                groupTypes.RESEARCH_LINE,
                groupTypes.RESEARCH_DOMAIN,
                groupTypes.FACILITY
            ].includes(vm.group.type);
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
