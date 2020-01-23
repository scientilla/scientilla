(function () {
    angular
            .module('auth')
            .controller('RegisterController', RegisterController);

    RegisterController.$inject = [
        'AuthService',
        'Notification',
        '$location'
    ];

    function RegisterController(AuthService, Notification, $location) {
        var vm = this;
        vm.user = {
            name: "",
            surname: "",
            username: "",
            password: ""
        };

        vm.submit = submit;

        function submit() {
            AuthService.register(vm.user)
                .then(function () {
                    $location.url('/');
                }).catch(function(){
                    Notification.warning('Registration failed');
                });
        }
    }
})();
