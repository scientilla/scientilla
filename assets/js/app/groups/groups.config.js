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
            .when("/groups/:id", {
                redirectTo: '/groups/:id/info'
            })
            .when("/groups/:id/info", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="info"></scientilla-group-details>`
            })
            .when("/groups/:id/members", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="members"></scientilla-group-details>`
            })
            .when("/groups/:id/child-groups", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="child-groups"></scientilla-group-details>`
            })
            .when("/groups/:id/documents", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="documents"></scientilla-group-details>`
            })
            .when("/groups/:id/accomplishments", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="accomplishments"></scientilla-group-details>`
            })
            .when("/groups/:id/projects", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="projects"></scientilla-group-details>`
            })
            .when("/groups/:id/documents-overview", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="documents-overview"></scientilla-group-details>`
            })
            .when("/groups/:id/bibliometric-charts", {
                template: params => `<scientilla-group-details
                    group-id="${params.id}"
                    active-tab="bibliometric-charts"></scientilla-group-details>`
            })
            .when("/:group/info", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/members", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/child-groups", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/documents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/accomplishments", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/projects", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/documents-overview", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="documents-overview"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            })
            .when("/:group/bibliometric-charts", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-slug="$resolve.slug"
                    active-tab="bibliometric-charts"></scientilla-group-details>`,
                resolve: {
                    slug: getSlug
                }
            });

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