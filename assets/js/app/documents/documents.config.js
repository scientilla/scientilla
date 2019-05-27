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
                    researchEntity: getSubResearchEntity,
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
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/drafts", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-drafts-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-drafts-list>',
                resolve: {
                    researchEntity: getSubResearchEntity,
                    authService: getAuthService
                }
            })
            .when("/:group?/documents/external", {
                controller: handleRequest,
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


        handleRequest.$inject = [
            '$scope',
            '$routeParams',
            'path',
            'authService',
            'context'
        ];

        /*
         * This function handles the request declared above.
         * It validates the group slug (optional) and redirects if the group slug is not valid.
         */
        function handleRequest($scope, $routeParams, path, authService, context) {
            let activeGroup;
            const user = authService.user;

            if (!$routeParams.group)
                return context.setSubResearchEntity(user);

            activeGroup = user.administratedGroups.find(g => g.slug === $routeParams.group);

            if (activeGroup)
                return context.setSubResearchEntity(activeGroup);

            path.goTo('/');
        }
    }

})();
