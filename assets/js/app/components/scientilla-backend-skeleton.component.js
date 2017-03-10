(function () {
    'use strict';

    angular.module('components')
        .component('scientillaBackendSkeleton', {
            templateUrl: 'partials/scientilla-backend-skeleton.html',
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