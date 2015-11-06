(function () {
    angular
            .module('auth')
            .controller('LogoutController', LogoutController);

    LogoutController.$inject = [
        'AuthService',
        '$location'
    ];

    function LogoutController(AuthService, $location) {

        activate();

        function activate() {
            AuthService.logout().then(function() {
                $location.path('/');
            })
        }
    }

})();
