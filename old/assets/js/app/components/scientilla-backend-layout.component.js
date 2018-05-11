(function () {
    'use strict';

    angular.module('components')
        .component('scientillaBackendLayout', {
            templateUrl: 'partials/scientilla-backend-layout.html',
            controller: scientillaBackendLayout,
            controllerAs: 'vm',
            transclude: true
        });

    scientillaBackendLayout.$inject = [
        '$rootScope'
    ];

    function scientillaBackendLayout($rootScope) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'backend';
        };

        vm.$onDestroy = function () {
        };
    }

})();