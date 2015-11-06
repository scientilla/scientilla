(function () {
    angular
            .module('components')
            .controller('MenuController', MenuController);

    MenuController.$inject = ['AuthService', '$scope'];

    function MenuController(AuthService, $scope) {
        var vm = this;

        $scope.$on('LOGIN', refresh);
        $scope.$on('LOGOUT', refresh);

        function refresh() {
            vm.userId = AuthService.userId;
        }
    }
})();
