(function () {
    angular
        .module('projects')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/projects/verified", {
                controller: 'requestHandler',
                template: () => '' +
                    '<scientilla-project-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-project-verified-list>',
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