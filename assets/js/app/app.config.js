(function () {
    angular
        .module('app')
        .config(configure)
        .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider) {
        $routeProvider
            .when("/", {
                template: "<profile-summary></profile-summary>"
            })
            .otherwise({
                redirectTo: "/"
            });

        //sTODO: set request error interceptor

        localStorageServiceProvider
            .setPrefix('scientilla');
    }

    // unused services are injected for initialization purpose
    run.$inject = ['$rootScope', 'AuthService', 'Restangular', 'Prototyper', 'path', 'context'];

    function run($rootScope, AuthService, Restangular, Prototyper, path) {

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

        $rootScope.$on('$viewContentLoaded', () => {
            if (!AuthService.isLogged)
                AuthService.loadAuthenticationData();
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
        Restangular.extendCollection('documents', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('external-documents', Prototyper.toDocumentsCollection);
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
