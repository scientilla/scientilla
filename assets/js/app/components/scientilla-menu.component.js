(function () {
    'use strict';

    angular.module('components')
        .component('scientillaMenu', {
            templateUrl: 'partials/scientillaMenu.html',
            controller: scientillaMenu,
            controllerAs: 'vm'
        });

    scientillaMenu.$inject = [
        'AuthService',
        'EventsService',
        'path'
    ];

    function scientillaMenu(AuthService, EventsService, path) {
        var vm = this;

        vm.isActive = isActive;

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

        function isActive(linkUrl) {
            return path.current === linkUrl;
        }
    }

})();