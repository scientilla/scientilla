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
            .when("/agreement-groups/:group", {
                redirectTo: '/agreement-groups/:group/info'
            })
            .when("/agreement-groups/:group/info", {
                controller: 'requestHandler',
                template: params => `<agreement-group-details
                    group-id="${params.group}"
                    active-tab="info"></agreement-group-details>`
            })
            .when("/agreement-groups/:group/members", {
                controller: 'requestHandler',
                template: params => `<agreement-group-details
                    group-id="${params.group}"
                    active-tab="members"></agreement-group-details>`
            })
            .when("/agreement-groups/:group/documents", {
                controller: 'requestHandler',
                template: params => `<agreement-group-details
                    group-id="${params.group}"
                    active-tab="documents"></agreement-group-details>`
            })
            .when("/agreement-groups/:group/accomplishments", {
                controller: 'requestHandler',
                template: params => `<agreement-group-details
                    group-id="${params.group}"
                    active-tab="accomplishments"></agreement-group-details>`
            })
            .when("/agreement-groups/:group/patents", {
                controller: 'requestHandler',
                template: params => `<agreement-group-details
                    group-id="${params.group}"
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