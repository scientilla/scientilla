(function () {
    angular
        .module('agreements')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/agreement-groups", {
                templateUrl: "partials/agreement-browsing.html",
                controller: "AgreementBrowsingController",
                controllerAs: 'vm'
            })
            .when("/agreement-groups/:id", {
                redirectTo: '/agreement-groups/:id/info'
            })
            .when("/agreement-groups/:id/info", {
                template: params => `<agreement-group-details
                    group-id="${params.id}"
                    active-tab="info"></agreement-group-details>`
            })
            .when("/agreement-groups/:id/members", {
                template: params => `<agreement-group-details
                    group-id="${params.id}"
                    active-tab="members"></agreement-group-details>`
            })
            .when("/agreement-groups/:id/documents", {
                template: params => `<agreement-group-details
                    group-id="${params.id}"
                    active-tab="documents"></agreement-group-details>`
            })
            .when("/agreement-groups/:id/accomplishments", {
                template: params => `<agreement-group-details
                    group-id="${params.id}"
                    active-tab="accomplishments"></agreement-group-details>`
            })
            .when("/agreement-groups/:id/patents", {
                template: params => `<agreement-group-details
                    group-id="${params.id}"
                    active-tab="projects"></agreement-group-details>`
            })
            .when("/:group?/agreements/verified", {
                controller: 'requestHandler',
                template: () => '<scientilla-agreement-verified-list></scientilla-agreement-verified-list>'
            })
            .when("/:group?/agreements/drafts", {
                controller: 'requestHandler',
                template: () => '<scientilla-agreement-drafts-list></scientilla-agreement-drafts-list>'
            });
    }

})();