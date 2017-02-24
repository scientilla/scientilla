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
        vm.menuItems = [{
            type: 'label',
            title: 'Personal'
        }, {
            type: 'item',
            title: 'Summary',
            url: '#/'
        },{
            type: 'separator'
        }, {
            type: 'label',
            title: 'Documents'
        }, {
            type: 'item',
            title: 'Suggested',
            url: '#/suggested'
        }, {
            type: 'item',
            title: 'Verified',
            url: '#/verified'
        }, {
            type: 'item',
            title: 'Drafts',
            url: '#/drafts'
        }, {
            type: 'item',
            title: 'External',
            url: '#/external'
        },{
            type: 'separator'
        }, {
            type: 'label',
            title: 'System'
        }, {
            type: 'item',
            title: 'People',
            url: '#/users'
        }, {
            type: 'item',
            title: 'Groups',
            url: '#/groups'
        }];

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

        function isActive(menuItem) {
            return path.current === menuItem.url;
        }
    }

})();