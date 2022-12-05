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
        'groupTypes',
        'DateService',
        'EventsService'
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
        groupTypes,
        DateService,
        EventsService
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;
        vm.addCollaborator = addCollaborator;
        vm.format = DateService.format;

        vm.getDescriptionsTooltipHTML = descriptions => {
            return `<ul class="tooltip-listing">${descriptions.map(description => `<li>
                <strong>${description.description}</strong> (${vm.format(description.startDate).toLocaleDateString()} - ${description.endDate ? vm.format(description.endDate).toLocaleDateString() : 'now'})
            </li>`).join('')}</ul>`;
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            vm.descriptions = vm.group.getDescriptionHistory();

            vm.initializeTabs(vm.tabs);

            EventsService.subscribeAll(vm, [
                EventsService.GROUP_UPDATED,
                EventsService.COLLABORATOR_CREATED,
                EventsService.COLLABORATOR_UPDATED,
                EventsService.COLLABORATOR_DELETED
            ], () => {
                refreshGroup();
            });
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        /* jshint ignore:start */
        async function refreshGroup() {
            vm.group = await GroupsService.getGroup(vm.group.id);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);

            if (vm.activeTabIndex === 1) {
                $scope.$broadcast('refreshList');
            }
        }
        /* jshint ignore:end */

        vm.isSuperUser = function () {
            return vm.loggedUser && vm.loggedUser.isSuperUser();
        };

        vm.isGroupAdmin = function () {
            return GroupsService.isGroupAdmin(vm.group, vm.loggedUser);
        };

        vm.isScientific = function () {
            if (!vm.group)
                return false;
            return [
                groupTypes.INSTITUTE,
                groupTypes.CENTER,
                groupTypes.RESEARCH_LINE,
                groupTypes.RESEARCH_DOMAIN,
                groupTypes.FACILITY,
                groupTypes.INITIATIVE
            ].includes(vm.group.type);
        };

        vm.showScientificProduction = function () {
            if (!vm.group) {
                return false;
            }

            switch (vm.group.type) {
                case groupTypes.INSTITUTE:
                case groupTypes.CENTER:
                    return vm.isGroupAdmin() || vm.isSuperUser() || vm.loggedUser.isAdmin();
                case groupTypes.RESEARCH_LINE:
                case groupTypes.FACILITY:
                    return vm.loggedUser.isAdmin();
                default:
                    return false;
            }
        };

        function addCollaborator() {
            ModalService.openCollaboratorForm(vm.group);
        }
    }
})();
