(function () {
    "use strict";

    angular.module('summary')
        .component('summaryProfile', {
            templateUrl: 'partials/summary-profile.html',
            controller,
            controllerAs: 'vm',
        });

    controller.$inject = [
        'AuthService',
        'UsersService'
    ];

    function controller(AuthService, UsersService) {
        const vm = this;

        vm.profile = false;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.profile = await UsersService.getProfile(AuthService.user.researchEntity);
        };
        /* jshint ignore:end */
    }
})();