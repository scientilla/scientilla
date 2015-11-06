(function () {
    angular
            .module('components')
            .controller('HeaderController', HeaderController);

    HeaderController.$inject = ['AuthService', '$scope'];

    function HeaderController(AuthService, $scope) {
        var vm = this;

        $scope.$on('LOGIN', refresh);
        $scope.$on('LOGOUT', refresh);

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.userId = AuthService.userId;
        }
    }
})();
