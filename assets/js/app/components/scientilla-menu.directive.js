(function () {
    'use strict';

    angular.module('components')
            .directive('scientillaMenu', scientillaMenu);

    function scientillaMenu() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaMenu.html',
            controller: scientillaMenuController,
            controllerAs: 'vm',
            scope: {
            }
        };
    }

    scientillaMenuController.$inject = [
        'AuthService',
        '$scope',
        '$location'
    ];

    function scientillaMenuController(AuthService, $scope, $location) {
        var vm = this;

        vm.menuItemClicked = menuItemClicked;

        activate();

        function activate() {
            $scope.$on('LOGIN', refresh);
            $scope.$on('LOGOUT', refresh);

            refresh();
        }

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;

            if (vm.user) {
                vm.menuItems = [
                    {
                        type: 'item',
                        title: 'Notifications',
                        url: '#/users/' + vm.user.id + '/notifications'
                    },
                    {
                        type: 'separator'
                    },
                    {
                        type: 'item',
                        title: 'Personal documents',
                        url: '#/users/' + vm.user.id + '/references'
                    }
                ];
                _.forEach(vm.user.admininstratedGroups, function (g) {
                    vm.menuItems.push({
                        type: 'item',
                        title: g.getDisplayName() + ' Documents',
                        url: '#/groups/' + g.id + '/references'
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
        
        function resetSelection(){
            _.each(vm.menuItems, function (i) {
                i.active = false;
            });
        }
    }

})();