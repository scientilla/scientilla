(function () {
    angular
        .module('app')
        .config(configure)
        .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider', 'apiPrefix'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider, apiPrefix) {
        $routeProvider
            .when("/", {
                template: "<profile-summary></profile-summary>"
            })
            .otherwise({
                redirectTo: "/"
            });

        RestangularProvider.setBaseUrl('/api/v1');

        //sTODO: set request error interceptor

        localStorageServiceProvider
            .setPrefix('scientilla');
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
        $rootScope.$on('$routeChangeSuccess', function (event, current) {
            $rootScope.bodyClass = current.$$route.bodyClass;
        });

        $rootScope.$on('$viewContentLoaded', () => {
            if (!AuthService.isLogged)
                AuthService.loadAuthenticationData();
        });

        Restangular.setErrorInterceptor(function(response, deferred, responseHandler) {
            if(response.status === 403) {
                Notification.warning('Your session is expired. Please login again.');
                ModalService.dismiss(null);
                path.goTo('/logout');
                return false;
            }
            return true;
        });

        Restangular.addResponseInterceptor((response, operation) => {
            if (operation === 'getList') {
                var newResponse = response.items;
                newResponse.count = response.count;
                return newResponse;
            }
            return response;
        });

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
        Restangular.extendCollection('groups', Prototyper.toGroupsCollection);
        Restangular.extendCollection('taglabels', Prototyper.toTagLabelsCollection);
    }
})();
