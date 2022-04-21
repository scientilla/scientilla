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
        'DateService'
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
        DateService
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;
        vm.addCollaborator = addCollaborator;
        vm.format = DateService.format;

        let activeTabWatcher = null;

        vm.getDescriptionsTooltipHTML = descriptions => {
            return `<ul class="tooltip-listing">${descriptions.map(description => `<li>
                <strong>${description.description}</strong> (${vm.format(description.startDate).toLocaleDateString()} - ${description.endDate ? vm.format(description.endDate).toLocaleDateString() : 'now'})
            </li>`).join('')}</ul>`;
        };

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

            vm.descriptions = vm.group.getDescriptionHistory();

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
