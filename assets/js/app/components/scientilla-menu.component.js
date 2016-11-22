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
        '$location'
    ];

    function scientillaMenu(AuthService, EventsService, $location) {
        var vm = this;

        vm.menuItemClicked = menuItemClicked;

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

            if (vm.user) {
                vm.menuItems = [
                    {
                        type: 'item',
                        title: 'Personal documents',
                        url: '#/users/' + vm.user.id + '/documents'
                    }
                ];
                _.forEach(vm.user.administratedGroups, function (g) {
                    vm.menuItems.push({
                        type: 'item',
                        title: g.getDisplayName() + ' Documents',
                        url: '#/groups/' + g.id + '/documents'
                    });
                });
                vm.menuItems = _.union(vm.menuItems, [{
                    type: 'separator'
                }, {
                    type: 'item',
                    title: 'People',
                    url: '#/users'
                }, {
                    type: 'item',
                    title: 'Groups',
                    url: '#/groups'
                }]);
            }

            _.each(vm.menuItems, function (i) {
                if (i.url === '#' + $location.path())
                    i.active = true;
            });
        }

        function menuItemClicked(item) {

            if (item.type !== 'item')
                return;

            resetSelection();

            item.active = true;

        }

        function resetSelection() {
            _.each(vm.menuItems, function (i) {
                i.active = false;
            });
        }
    }

})();