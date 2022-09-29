/* global angular */
(function () {
    angular
        .module('groups')
        .component('agreementGroupDetails', {
            controller: AgreementGroupDetailsController,
            templateUrl: 'partials/agreement-group-details.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                tabs: '<',
                activeTab: '@?'
            }
        });

        AgreementGroupDetailsController.$inject = [
        'GroupsService',
        'context',
        'AuthService',
        '$scope',
        '$controller',
        'ResearchEntitiesService',
        'ModalService'
    ];

    function AgreementGroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService,
        ModalService
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;
        vm.addCollaborator = addCollaborator;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            vm.initializeTabs(vm.tabs);
        };

        async function refreshGroup() {
            vm.group = await GroupsService.getGroup(vm.group.id);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);
        }
        /* jshint ignore:end */

        vm.isGroupAdmin = function () {
            return GroupsService.isGroupAdmin(vm.group, vm.loggedUser);
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
