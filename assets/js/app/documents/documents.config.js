(function () {
    angular
        .module('documents')
        .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
            .when("/:group?/documents/suggested", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-suggested-documents research-entity="$resolve.researchEntity">' +
                    '</scientilla-suggested-documents>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService,
                    context: getContext
                }
            })
            .when("/:group?/documents/verified", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-verified-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/drafts", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-drafts-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-drafts-list>',
                resolve: {
                    researchEntity: getResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/external", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-external-documents research-entity="$resolve.researchEntity">' +
                    '</scientilla-external-documents>',
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

        getContext.$inject = ['context'];

        function getContext(context) {
            return context;
        }


        /*handleRequest.$inject = [
            '$scope',
            '$routeParams',
            'path',
            'authService',
            'context'
        ];*/

        /*
         * This function handles the document requests declared above.
         * It validates the group slug (optional) and redirects if the group slug is not valid.
         */
        function handleRequest($scope, $routeParams, path, authService, context) {
            let activeGroup = false,
                user = authService.user,
                redirectLocation;

            if (!$routeParams.group)
                return context.setResearchEntity(user);

            user.administratedGroups.forEach(group => {
                if (group.slug === $routeParams.group) {
                    activeGroup = group;
                }
            });

            if (activeGroup)
                return context.setResearchEntity(activeGroup);

            redirectLocation = path.locationPath();
            redirectLocation = redirectLocation.replace(redirectLocation.match(/[/]*\/([^/]*)/)[0], '');

            path.goTo(redirectLocation);
        }
    }

})();
