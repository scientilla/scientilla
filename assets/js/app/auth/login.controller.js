(function () {
    angular
            .module('auth')
            .controller('LoginController', LoginController);

    LoginController.$inject = [
        'AuthService',
        'FormForConfiguration',
        'Notification',
        '$scope',
        '$location'
    ];

    function LoginController(AuthService, FormForConfiguration, Notification, $scope, $location) {
        var vm = this;
        vm.formData = {
            username: "",
            email: "",
            password: ""
        };
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;


        vm.validationAndViewRules = {
            username: {
                inputType: 'text',
                required: true
            },
            password: {
                inputType: 'password',
                required: true
            }
        };

        vm.submit = submit;

        activate();

        function activate() {
            vm.status = vm.STATUS_WAITING;
            FormForConfiguration.enableAutoLabels();

            $scope.$watch('vm.formData.email', emailChanged);

        }

        function submit() {
            vm.status = vm.STATUS_LOADING;
            return AuthService.login(vm.formData)
                    .catch(function () {
                        Notification.warning('Login failed');
                        vm.formData.password = "";
                        vm.status = vm.STATUS_WAITING;
                    });
        }

        function emailChanged() {
            vm.formData.username = vm.formData.email;
        }

    }
})();
