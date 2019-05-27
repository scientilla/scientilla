/* global angular */
(function () {
    angular
        .module('users')
        .component('scientillaUserDetails', {
            controller: controller,
            templateUrl: 'partials/scientilla-user-details.html',
            controllerAs: 'vm',
            bindings: {
                userId: '<'
            }
        });

    controller.$inject = [
        'ResearchEntitiesService',
        'UsersService',
        'documentListSections',
        'accomplishmentListSections',
        'AuthService',
        '$scope',
        '$controller'
    ];

    function controller(ResearchEntitiesService, UsersService, documentListSections, accomplishmentListSections, AuthService, $scope, $controller) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));

        vm.documentListSections = documentListSections;
        vm.accomplishmentListSections = accomplishmentListSections;
        vm.loggedUser = AuthService.user;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.user = await UsersService.getUser(vm.userId);
            vm.researchEntity = await ResearchEntitiesService.getResearchEntity(vm.user.researchEntity);
            vm.chartsData = await vm.getChartsData(vm.user);
        };
        /* jshint ignore:end */
    }

})();
