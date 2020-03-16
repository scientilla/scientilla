(function () {

    angular
        .module('app')
        .config(configure)
        .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider', 'NotificationProvider'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider, NotificationProvider) {
        $routeProvider
            .when("/", {
                redirectTo: '/dashboard'
            })
            .otherwise({
                redirectTo: "/dashboard"
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
        'ModalService',
        '$location',
        '$route'
    ];
    run.$inject = _.union(services, servicesToInit);

    function run($rootScope, AuthService, Restangular, Prototyper, path, Notification, ModalService, $location, $route) {

        var originalUrl = $location.url;
        $location.url = function (url, reload = true) {
            if (reload === false) {
                var lastRoute = $route.current;
                var un = $rootScope.$on('$locationChangeSuccess', function () {
                    $route.current = lastRoute;
                    un();
                });
            }
            return originalUrl.apply($location, [url]);
        };

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
        Restangular.extendCollection('favoriteDocuments', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('drafts', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('authorships', Prototyper.toAuthorshipsCollection);
        Restangular.extendCollection('institutes', Prototyper.toInstitutesCollection);
        Restangular.extendCollection('users', Prototyper.toUsersCollection);
        Restangular.extendCollection('allMembers', Prototyper.toUsersCollection);
        Restangular.extendCollection('groups', Prototyper.toGroupsCollection);
        Restangular.extendCollection('taglabels', Prototyper.toTagLabelsCollection);
    }
})();
