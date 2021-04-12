(function () {
    'use strict';

    angular.module('cookies')
        .component('cookiesPolicy', {
            templateUrl: 'partials/cookies-policy.html',
            controller: cookiesPolicy,
            controllerAs: 'vm',
        });

    cookiesPolicy.$inject = [];

    function cookiesPolicy() {
        var vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();