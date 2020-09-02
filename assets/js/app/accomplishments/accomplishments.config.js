(function () {
    angular
        .module('accomplishments')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/accomplishments/suggested", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-accomplishment-suggested-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-accomplishment-suggested-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/accomplishments/verified", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-accomplishment-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-accomplishment-verified-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/accomplishments/drafts", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-accomplishment-drafts-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-accomplishment-drafts-list>',
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