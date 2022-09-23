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
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/members", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/child-groups", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/documents", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/accomplishments", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/projects", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/patents", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="patents"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/training-modules", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="training-modules"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/document-charts", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="document-charts"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/metric-charts", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="metric-charts"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/projects-technology-transfer", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="projects-technology-transfer"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/groups/:group/scientific-production", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="scientific-production"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/info", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/members", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/child-groups", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/documents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/accomplishments", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/projects", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/patents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="patents"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/document-charts", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="document-charts"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/metric-charts", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="metric-charts"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/projects-technology-transfer", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="projects-technology-transfer"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group/scientific-production", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.param"
                    active-tab="scientific-production"></scientilla-group-details>`,
                resolve: {
                    param: getSlugOrId
                }
            })
            .when("/:group", {
                controller: 'requestHandler',
                template: () => '',
                resolve: {
                    param: getSlugOrId
                }
            })
            .otherwise({ redirectTo: '/404' });

        getSlugOrId.$inject = ['$route'];

        function getSlugOrId($route) {
            let slug = false;

            if (_.has($route, 'current.params.group')) {
                slug = $route.current.params.group;
            }

            return slug;
        }
    }
})();
