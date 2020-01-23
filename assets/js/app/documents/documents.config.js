(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/documents/suggested", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-suggested-documents research-entity="$resolve.researchEntity">' +
                    '</scientilla-suggested-documents>',
                resolve: {
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService,
                    context: getContext
                }
            })
            .when("/:group?/documents/verified", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-verified-list>',
                resolve: {
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/drafts", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-drafts-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-drafts-list>',
                resolve: {
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/external", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-external-documents research-entity="$resolve.researchEntity">' +
                    '</scientilla-external-documents>',
                resolve: {
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService
                }
            });

        getSubResearchEntity.$inject = ['context'];

        function getSubResearchEntity(context) {
            return context.getSubResearchEntity();
        }

        getAuthService.$inject = ['AuthService'];

        function getAuthService(AuthService) {
            return AuthService;
        }

        getContext.$inject = ['context'];

        function getContext(context) {
            return context;
        }
    }

})();
