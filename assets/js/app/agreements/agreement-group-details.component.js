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
        'ModalService',
        'EventsService'
    ];

    function AgreementGroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService,
        ModalService,
        EventsService
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

            EventsService.subscribeAll(vm, [
                EventsService.COLLABORATOR_CREATED,
                EventsService.COLLABORATOR_UPDATED,
                EventsService.COLLABORATOR_DELETED
            ], () => {
                refreshGroup();
            });
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        async function refreshGroup() {
            vm.group = await GroupsService.getGroup(vm.group.id);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            if (vm.activeTabIndex === 1) {
                $scope.$broadcast('refreshList');
            }
        }
        /* jshint ignore:end */

        vm.isGroupAdmin = function () {
            return GroupsService.isGroupAdmin(vm.group, vm.loggedUser);
        };

        function addCollaborator() {
            ModalService.openCollaboratorForm(vm.group);
        }
    }
})();
