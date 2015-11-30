(function () {
    angular
            .module('auth')
            .controller('RegisterController', RegisterController);

    RegisterController.$inject = [
        'AuthService',
        'UsersService',
        'FormForConfiguration',
        '$scope',
        '$location'
    ];

    function RegisterController(AuthService, UsersService, FormForConfiguration, $scope, $location) {
        var vm = this;
        vm.user = {
            name: "",
            surname: "",
            username: "",
            password: ""
        };


        vm.validationAndViewRules = {
            name: {
                inputType: 'text',
                required: true
            },
            surname: {
                inputType: 'text',
                required: true
            },
            username: {
                inputType: 'text',
                required: true
            },
            password: {
                inputType: 'password',
                required: true,
            },
        };

        vm.submit = submit;

        activate();

        function activate() {
            FormForConfiguration.enableAutoLabels();

        }

        function submit() {
            AuthService.register(vm.user)
                    .then(function () {
                        $location.path("/");
                    });
        }
    }
})();
