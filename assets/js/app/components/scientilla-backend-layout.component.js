(function () {
    'use strict';

    angular.module('components')
        .component('scientillaBackendLayout', {
            templateUrl: 'partials/scientilla-backend-layout.html',
            controller: scientillaBackendLayout,
            controllerAs: 'vm',
            transclude: true
        });

    scientillaBackendLayout.$inject = [];

    function scientillaBackendLayout() {
        var vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();