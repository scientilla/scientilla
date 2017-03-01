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
                });
    }

    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases']});
    }
})();
