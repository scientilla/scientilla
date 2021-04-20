(function () {
    'use strict';

    angular.module('profile')
        .component('profileLegend', {
            templateUrl: 'partials/profile-legend.html',
            controller: profileLegend,
            controllerAs: 'vm',
            bindings: {
            }
        });

    profileLegend.$inject = [];

    function profileLegend() {
        const vm = this;

        vm.$onInit = function () {

        };
    }

})();