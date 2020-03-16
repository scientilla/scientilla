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
        '$controller'
    ];

    function GroupDetailsController(GroupsService, context, AuthService, $scope, $controller) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
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
                    slug: 'documents-overview',
                    tabName: 'overview',
                    getData: getData
                }, {
                    index: 5,
                    slug: 'bibliometric-charts',
                    tabName: 'metrics',
                    getData: getData
                }
            ];

            vm.initializeTabs(tabIdentifiers);
        };

        async function getData() {
            return await vm.getChartsData(vm.group);
        }

        /* jshint ignore:end */

        function refreshGroup() {
            return GroupsService.getGroup(vm.groupId)
                .then(group => vm.group = group);
        }
    }
})();
