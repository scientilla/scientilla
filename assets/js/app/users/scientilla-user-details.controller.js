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
        'UsersService',
        'documentListSections',
        'AuthService',
        '$scope',
        '$controller'
    ];

    function controller(UsersService, documentListSections, AuthService, $scope, $controller) {
        const vm = this;
        angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));

        vm.documentListSections = documentListSections;
        vm.loggedUser = AuthService.user;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.user = await UsersService.getUser(vm.userId);
            vm.chartsData = await vm.getChartsData(vm.user);
        };
        /* jshint ignore:end */
    }

})();
