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
        '$rootScope',
        '$window',
        'MobileMenuService'
    ];

    function scientillaBackendLayout($rootScope, $window, MobileMenuService) {
        var vm = this;

        vm.toggleMobileMenu = toggleMobileMenu;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'backend';
            MobileMenuService.close();
        };

        vm.$onDestroy = function () {
        };

        function toggleMobileMenu() {
            MobileMenuService.toggle();
        }
    }
})();