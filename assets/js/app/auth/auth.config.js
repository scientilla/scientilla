(function () {
    angular
            .module('auth')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/login", {
                    templateUrl: "partials/login.html",
                    controller: "LoginController",
                    controllerAs: 'vm',
                    access: {
                        noLogin: true
                    }
                })
                .when("/register", {
                    templateUrl: "partials/register.html",
                    controller: "RegisterController",
                    controllerAs: 'vm',
                    resolve: {
                        user: getNewUser
                    },
                    access: {
                        noLogin: true
                    }
                })
                .when("/logout", {
                    template: "",
                    controller: "LogoutController"
                })
    }



    getNewUser.$inject = ['UsersService'];

    function getNewUser(UsersService) {
        return UsersService.getNewUser();
    }
})();
