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
                redirectTo: '/users/:id/profile'
            })
            .when("/users/:id/profile", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="profile"></scientilla-user-details>`
            })
            .when("/users/:id/groups", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="groups"></scientilla-user-details>`
            })
            .when("/users/:id/documents", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="documents"></scientilla-user-details>`
            })
            .when("/users/:id/accomplishments", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="accomplishments"></scientilla-user-details>`
            })
            .when("/users/:id/projects", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="projects"></scientilla-user-details>`
            })
            .when("/users/:id/patents", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="patents"></scientilla-user-details>`
            })
            .when("/users/:id/training-modules", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="training-modules"></scientilla-user-details>`
            })
            .when("/users/:id/documents-overview", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="documents-overview"></scientilla-user-details>`
            })
            .when("/users/:id/bibliometric-charts", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="bibliometric-charts"></scientilla-user-details>`
            })
            .when("/users/:id/projects-technology-transfer", {
                template: params => `<scientilla-user-details
                    user-id="${params.id}"
                    active-tab="projects-technology-transfer"></scientilla-user-details>`
            });
    }

    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['aliases', 'memberships']});
    }
})();
