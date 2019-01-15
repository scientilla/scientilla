(function () {
    angular
        .module('accomplishments')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/accomplishments/verified", {
                controller: handleRequest,
                template: params => '' +
                '<scientilla-accomplishment-verified-list research-entity="$resolve.researchEntity">' +
                '</scientilla-accomplishment-verified-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/accomplishments/drafts", {
                controller: handleRequest,
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

        handleRequest.$inject = [
            '$scope',
            '$routeParams',
            'path',
            'authService',
            'context'
        ];

        /*
         * This function handles the document requests declared above.
         * It validates the group slug (optional) and redirects if the group slug is not valid.
         */
        function handleRequest($scope, $routeParams, path, authService, context) {
            let activeGroup      = false,
                user             = authService.user,
                redirectLocation = '/';

            if ($routeParams.group) {
                user.administratedGroups.map(group => {
                    if (group.slug === $routeParams.group) {
                        activeGroup = group;
                    }
                });

                if (!activeGroup) {
                    redirectLocation = path.locationPath();
                    redirectLocation = redirectLocation.replace(redirectLocation.match(/[/]*\/([^/]*)/)[0], '');

                    path.goTo(redirectLocation);
                } else {
                    context.setResearchEntity(activeGroup);
                }
            } else {
                context.setResearchEntity(user);
            }
        }
    }

})();
