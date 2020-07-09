(function () {
    angular
        .module('projects')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            /*.when("/:group?/projects/suggested", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-project-suggested-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-project-suggested-list>',
                resolve: {
                    authService: getAuthService
                }
            })*/
            .when("/:group?/projects/verified", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-project-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-project-verified-list>',
                resolve: {
                    authService: getAuthService
                }
            })/*
            .when("/:group?/projects/drafts", {
                controller: 'requestHandler',
                template: params => '' +
                    '<scientilla-project-drafts-list>' +
                    '</scientilla-project-drafts-list>',
                resolve: {
                    authService: getAuthService
                }
            })*/;

        getAuthService.$inject = ['AuthService'];

        function getAuthService(AuthService) {
            return AuthService;
        }
    }

})();