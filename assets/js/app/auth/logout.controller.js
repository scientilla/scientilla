(function () {
    angular
            .module('auth')
            .controller('LogoutController', LogoutController);

    LogoutController.$inject = [
        'AuthService',
        '$location',
        'Notification'
    ];

    function LogoutController(AuthService, $location, Notification) {

        activate();

        function activate() {
            AuthService
                    .logout()
                    .then(function () {
                        $location.url('/');
                    })
                    .catch(function () {
                        Notification.warning('An error happened');
                    });
        }
    }

})();
