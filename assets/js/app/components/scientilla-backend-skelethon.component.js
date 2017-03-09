(function () {
    'use strict';

    angular.module('components')
        .component('scientillaBackendSkelethon', {
            templateUrl: 'partials/scientilla-backend-skelethon.html',
            controller: scientillaBackendSkelethon,
            controllerAs: 'vm',
            transclude: true
        });

    scientillaBackendSkelethon.$inject = [];

    function scientillaBackendSkelethon() {
        var vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();