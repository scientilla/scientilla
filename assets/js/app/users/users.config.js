(function () {
    angular
            .module('users')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/users", {
                    templateUrl: "partials/user-browsing.html",
                    controller: "UserBrowsingController",
                    controllerAs: 'vm',
                })
                .when("/users/new", {
                    templateUrl: "partials/user-form.html",
                    controller: "UserFormController",
                    controllerAs: 'vm',
                    resolve: {
                        user: getNewUser
                    }
                })
                .when("/users/:id", {
                    templateUrl: "partials/user-details.html",
                    controller: "UserDetailsController",
                    controllerAs: 'vm',
                    resolve: {
                        user: getCurrentUser
                    },
                    access: {
                        noLogin: true
                    }
                })
                .when("/users/:id/edit", {
                    templateUrl: "partials/user-form.html",
                    controller: "UserFormController",
                    controllerAs: 'vm',
                    resolve: {
                        user: getCurrentUser
                    }
                });
    }

    getNewUser.$inject = ['UsersService'];

    function getNewUser(UsersService) {
        return UsersService.getNewUser();
    }

    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases']});
    }
})();
