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