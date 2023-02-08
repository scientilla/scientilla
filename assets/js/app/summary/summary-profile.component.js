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
        'ResearchEntitiesService'
    ];

    function controller(AuthService, ResearchEntitiesService) {
        const vm = this;

        vm.profile = false;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            vm.profile = await ResearchEntitiesService.getProfile(AuthService.user.researchEntity);
        };
        /* jshint ignore:end */
    }
})();
