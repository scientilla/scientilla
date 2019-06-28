/* global angular */
(function () {
    angular
        .module('groups')
        .component('scientillaGroupDetails', {
            controller: GroupDetailsController,
            templateUrl: 'partials/scientilla-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupId: '<'
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
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.loggedUser = AuthService.user;
        vm.refreshGroup = refreshGroup;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            await refreshGroup();
            vm.chartsData = await vm.getChartsData(vm.group);
        };

        /* jshint ignore:end */

        function refreshGroup() {
            return GroupsService.getGroup(vm.groupId)
                .then(group => vm.group = group);
        }


    }
})();
