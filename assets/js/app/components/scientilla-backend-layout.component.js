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
        '$window'
    ];

    function scientillaBackendLayout($rootScope, $window) {
        var vm = this;

        vm.toggleMobileMenu = toggleMobileMenu;

        vm.$onInit = function () {
            $rootScope.bodyLayout = 'backend';
            $rootScope.mobileMenuIsOpen = false;
        };

        vm.$onDestroy = function () {
        };

        function toggleMobileMenu() {
            $rootScope.$emit('toggleMobileMenu');
        }

        $(window).resize(function() {
            $rootScope.$emit('stickyFooter');
            $rootScope.$emit('fixedHeader');
        });
    }
})();