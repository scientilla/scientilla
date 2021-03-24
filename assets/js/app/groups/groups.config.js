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
            .when("/groups/:group/info", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/members", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/child-groups", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/documents", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/accomplishments", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/projects", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/patents", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="patents"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/documents-overview", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="documents-overview"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group/bibliometric-charts", {
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="bibliometric-charts"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/groups/:group", {
                redirectTo: '/groups/:group/info'
            })
            .when("/:group/info", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="info"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/members", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="members"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/child-groups", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="child-groups"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/documents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="documents"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/accomplishments", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="accomplishments"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/projects", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="projects"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/patents", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="patents"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/documents-overview", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="documents-overview"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group/bibliometric-charts", {
                controller: 'requestHandler',
                template: () => `<scientilla-group-details
                    group-param="$resolve.group"
                    active-tab="bibliometric-charts"></scientilla-group-details>`,
                resolve: {
                    group: getGroup
                }
            })
            .when("/:group", {
                redirectTo: '/:group/info'
            });

        getGroup.$inject = ['$route'];

        function getGroup($route) {
            if (_.has($route, 'current.params.group')) {
                return $route.current.params.group;
            }

            return;
        }
    }
})();