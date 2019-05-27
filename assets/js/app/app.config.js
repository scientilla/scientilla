(function () {

    angular
        .module('app')
        .config(configure)
        .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider', 'apiPrefix', 'NotificationProvider'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider, apiPrefix, NotificationProvider) {
        $routeProvider
            .when("/:group?", {
                controller: handleRequest,
                template: "<profile-summary></profile-summary>",
                resolve: {
                    authService: getAuthService,
                    context: getContext
                }
            })
            .when("/:group?/accomplishments/verified", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-accomplishment-verified-list research-entity="$resolve.researchEntity">' +
                    '</scientilla-accomplishment-verified-list>',
                resolve: {
                    authService: getAuthService
                }
            })
            .when("/:group?/accomplishments/drafts", {
                controller: handleRequest,
                template: params => '' +
                    '<scientilla-accomplishment-drafts-list>' +
                    '</scientilla-accomplishment-drafts-list>',
                resolve: {
                    authService: getAuthService
                }
            })
            .otherwise({
                redirectTo: "/"
            });

        RestangularProvider.setBaseUrl('/api/v1');

        //sTODO: set request error interceptor

        localStorageServiceProvider
            .setPrefix('scientilla');

        NotificationProvider.setOptions({
            delay: 5000,
            startLeft: 15,
            positionX: 'left',
            positionY: 'bottom'
        });
    }

    // unused services are injected for initialization purpose
    const servicesToInit = ['context'];
    const services = [
        '$rootScope',
        'AuthService',
        'Restangular',
        'Prototyper',
        'path',
        'Notification',
        'ModalService'
    ];
    run.$inject = _.union(services, servicesToInit);

    function run($rootScope, AuthService, Restangular, Prototyper, path, Notification, ModalService) {

        $rootScope.$on("$routeChangeStart", (event, next, current) => {
            const noRedirectUrls = ['/unavailable', '/login'];
            const goingToNoRedirectUrl = next.$$route && noRedirectUrls.includes(next.$$route.originalPath);
            if (!goingToNoRedirectUrl && !AuthService.isAvailable && !AuthService.isAdmin) {
                Notification.warning('Sorry but scientilla is temporarly unavailable. Try again later.');
                ModalService.dismiss(null);
                path.goTo('/unavailable');
                return;
            }
            if (!AuthService.isLogged) {
                if (next.access && next.access.noLogin) {

                } else {
                    path.goTo("/login");
                }
            }
        });

        $rootScope.$on('$locationChangeSuccess', (event, current) =>
            path.current = path.getUrlPath(current)
        );

        $rootScope.$on('$viewContentLoaded', () => {
            if (!AuthService.isLogged && AuthService.isAvailable)
                AuthService.loadAuthenticationData();
        });

        Restangular.setErrorInterceptor(function (response, deferred, responseHandler) {
            const isLogged = response.headers('scientilla-logged') === 'true';
            if (response.status === 403 && isLogged) {
                Notification.warning('Your session is expired. Please login again.');
                ModalService.dismiss(null);
                AuthService.logout();
                return false;
            }

            return true;
        });

        Restangular.addResponseInterceptor((data, operation, what, url, response) => {
            const status = response.headers('scientilla-status');
            const isAdmin = response.headers('scientilla-admin') === 'true';
            AuthService.isAdmin = isAdmin;
            if (status === 'DISABLED') {
                AuthService.isAvailable = false;
                if (!isAdmin) {
                    Notification.warning('Sorry but scientilla is temporarly unavailable. Try again later.');
                    ModalService.dismiss(null);
                    path.goTo('/unavailable');
                }
            } else {
                AuthService.isAvailable = true;
            }

            if (operation === 'getList') {
                var newResponse = data.items;
                newResponse.count = data.count;
                return newResponse;
            }
            return data;
        });

        Restangular.extendModel('documents', Prototyper.toDocumentModel);
        Restangular.extendModel('users', Prototyper.toUserModel);
        Restangular.extendModel('groups', Prototyper.toGroupModel);
        Restangular.extendModel('drafts', Prototyper.toDocumentModel);
        Restangular.extendModel('externals', Prototyper.toDocumentModel);
        Restangular.extendCollection('documents', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('externalDocuments', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('suggestedDocuments', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('discardedDocuments', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('drafts', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('authorships', Prototyper.toAuthorshipsCollection);
        Restangular.extendCollection('institutes', Prototyper.toInstitutesCollection);
        Restangular.extendCollection('users', Prototyper.toUsersCollection);
        Restangular.extendCollection('allMembers', Prototyper.toUsersCollection);
        Restangular.extendCollection('groups', Prototyper.toGroupsCollection);
        Restangular.extendCollection('taglabels', Prototyper.toTagLabelsCollection);
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
})();
