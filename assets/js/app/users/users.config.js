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
            .when("/users/edit", {
                template: '<user-edit></user-edit>'
            })
            .when("/users/:id", {
                template: params => `<scientilla-user-details user-id="${params.id}"></scientilla-user-details>`
            });
    }

    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases', 'memberships']});
    }
})();
