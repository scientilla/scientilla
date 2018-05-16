(function () {
    'use strict';

    angular.module('components')
        .component('scientillaMenu', {
            templateUrl: 'partials/scientilla-menu.html',
            controller: scientillaMenu,
            controllerAs: 'vm'
        });

    scientillaMenu.$inject = [
        'AuthService',
        'EventsService',
        'path'
    ];

    function scientillaMenu(AuthService, EventsService, path) {
        const vm = this;

        vm.isActive = isActive;
        vm.isAdmin = isAdmin;

        vm.$onInit = function () {

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT
            ], refresh);

            refresh();
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };


        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
        }

        function isActive(page) {
            return (path.current === '?#' + page || path.current === '#' + page);
        }

        function isAdmin() {
            return vm.user && vm.user.isAdmin();
        }
    }

})();