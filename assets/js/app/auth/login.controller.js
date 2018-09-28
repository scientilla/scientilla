(function () {
    angular
            .module('auth')
            .controller('LoginController', LoginController);

    LoginController.$inject = [
        'AuthService',
        'Notification',
        '$scope',
        '$location'
    ];

    function LoginController(AuthService, Notification, $scope, $location) {
        var vm = this;

        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;

        vm.user = {
            username: "",
            password: ""
        };

        vm.submit = submit;

        activate();

        function activate() {
            vm.status = vm.STATUS_WAITING;
        }

        function submit() {
            vm.status = vm.STATUS_LOADING;
            //console.log(vm.user);
            return AuthService.login(vm.user)
                .catch(function (res) {
                    Notification.warning('Login failed');
                    vm.user.password = "";
                    vm.status = vm.STATUS_WAITING;
                    vm.user.error = res.data.error;
                    //console.log(vm.user);
                });
        }
    }
})();
