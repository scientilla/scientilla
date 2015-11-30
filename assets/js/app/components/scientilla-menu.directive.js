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
            vm.user = AuthService.user;
        }
    }

})();