/* global angular */
(function () {
    angular
        .module('groups')
        .component('agreementGroupDetails', {
            controller: AgreementGroupDetailsController,
            templateUrl: 'partials/agreement-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupId: '<',
                activeTab: '@?'
            }
        });

        AgreementGroupDetailsController.$inject = [
        'GroupsService',
        'context',
        'AuthService',
        '$scope',
        '$controller',
        'ResearchEntitiesService'
    ];

    function AgreementGroupDetailsController(
        GroupsService,
        context,
        AuthService,
        $scope,
        $controller,
        ResearchEntitiesService
    ) {
        const vm = this;
        angular.extend(vm, $controller('TabsController', {$scope: $scope}));
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            await refreshGroup();

            const tabIdentifiers = [
                {
                    index: 0,
                    slug: 'info',
                    tabName: 'group-info'
                }, {
                    index: 1,
                    slug: 'documents'
                }, {
                    index: 2,
                    slug: 'accomplishments'
                }, {
                    index: 3,
                    slug: 'patents'
                }
            ];

            vm.initializeTabs(tabIdentifiers);
        };

        async function refreshGroup() {
            vm.group = await GroupsService.getGroup(vm.groupId);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.group.researchEntity);
        }

        /* jshint ignore:end */
    }
})();
