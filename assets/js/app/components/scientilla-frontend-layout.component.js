(function () {
    'use strict';

    angular.module('components')
        .component('scientillaFrontendLayout', {
            templateUrl: 'partials/scientilla-frontend-layout.html',
            controller: scientillaFrontendLayout,
            controllerAs: 'vm',
            transclude: true
        });

    scientillaFrontendLayout.$inject = [
        '$rootScope'
    ];

    function scientillaFrontendLayout($rootScope) {
        var vm = this;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'frontend';
        };

        vm.$onDestroy = function () {
        };
    }

})();