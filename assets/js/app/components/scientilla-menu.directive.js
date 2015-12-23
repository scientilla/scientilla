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

    function scientillaMenuController($scope, AuthService) {
        var vm = this;

        $scope.$on('LOGIN', refresh);
        $scope.$on('LOGOUT', refresh);

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            
            if (vm.user) {
                vm.menuItems = [{
                        title: 'Notifications',
                        url: '#/users/' + vm.user.id + '/notifications'
                    },
                    {
                        title: 'External References',
                        url: '#/users/' + vm.user.id + '/external'
                    },
                    {
                        title: 'Personal References',
                        url: '#/users/' + vm.user.id + '/references'
                    }
                ];
                _.forEach(vm.user.admininstratedGroups, function (g) {
                    vm.menuItems.push({
                        title: g.getDisplayName() + ' references',
                        url: '#/groups/' + g.id + '/references'
                    });
                });
                vm.menuItems = _.union(vm.menuItems, [{
                        title: 'People',
                        url: '#/users'
                    },{
                        title: 'Groups',
                        url: '#/groups'
                    },{
                        title: 'Profile',
                        url: '#/users/' + vm.user.id + '/edit'
                    }]);
            }
        }
    }

})();