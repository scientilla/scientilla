(function () {
    angular
        .module('agreements')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/agreements/verified", {
                controller: 'requestHandler',
                template: () => '' +
                    '<scientilla-agreement-verified-list></scientilla-agreement-verified-list>',
                resolve: {
                    authService: getAuthService
                }
            })
            .when("/:group?/agreements/drafts", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-agreement-drafts-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-agreement-drafts-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            });

        getResearchEntity.$inject = ['context'];

        function getResearchEntity(context) {
            return context.getResearchEntity();
        }

        getAuthService.$inject = ['AuthService'];

        function getAuthService(AuthService) {
            return AuthService;
        }
    }

})();