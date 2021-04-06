(function () {
    angular
        .module('groups')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/groups", {
                templateUrl: "partials/group-browsing.html",
                controller: "GroupBrowsingController",
                controllerAs: 'vm'
            })
            .when("/groups/:group", {
                redirectTo: '/groups/:group/info'
            })
            .when("/groups/:group/info", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="info"></scientilla-group-details>`
            })
            .when("/groups/:group/members", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="members"></scientilla-group-details>`
            })
            .when("/groups/:group/child-groups", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="child-groups"></scientilla-group-details>`
            })
            .when("/groups/:group/documents", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="documents"></scientilla-group-details>`
            })
            .when("/groups/:group/accomplishments", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="accomplishments"></scientilla-group-details>`
            })
            .when("/groups/:group/projects", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="projects"></scientilla-group-details>`
            })
            .when("/groups/:group/patents", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="patents"></scientilla-group-details>`
            })
            .when("/groups/:group/documents-overview", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="documents-overview"></scientilla-group-details>`
            })
            .when("/groups/:group/bibliometric-charts", {
                template: params => `<scientilla-group-details
                    group-param="${params.group}"
                    active-tab="bibliometric-charts"></scientilla-group-details>`
            })
            .when("/:group/info", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/members", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/child-groups", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/documents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/accomplishments", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/projects", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/patents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="patents"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/documents-overview", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="documents-overview"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/bibliometric-charts", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.slug"
                    active-tab="bibliometric-charts"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group", {
                controller: 'requestHandler',
                template: () => '',
                resolve: {
                    slug: getSlug
                }
            })
            .otherwise({ redirectTo: '/404' });

        getSlug.$inject = ['$route'];

        function getSlug($route) {
            let slug = false;

            if (_.has($route, 'current.params.group')) {
                slug = $route.current.params.group;
            }

            return slug;
        }
    }
})();