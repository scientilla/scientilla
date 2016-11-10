(function () {
    angular
            .module('app')
            .config(configure)
            .run(run);

    configure.$inject = ['RestangularProvider', '$routeProvider', 'localStorageServiceProvider'];

    function configure(RestangularProvider, $routeProvider, localStorageServiceProvider) {
        $routeProvider
                .when("/", {
                    template: "",
                    controller: "HomeController"
                })
                .otherwise({
                    redirectTo: "/"
                });

        //sTODO: set request error interceptor

        localStorageServiceProvider
                .setPrefix('scientilla');
    }

    run.$inject = ['$rootScope', '$location', 'AuthService', 'Restangular', 'Prototyper'];

    function run($rootScope, $location, AuthService, Restangular, Prototyper) {
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            if (!AuthService.isLogged) {
                if (next.access && next.access.noLogin) {

                } else {
                    $location.path("/login");
                }
            }
        });

        Restangular.addResponseInterceptor(function (response, operation) {
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
        Restangular.extendCollection('discardedReferences', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('drafts', Prototyper.toDocumentsCollection);
        Restangular.extendCollection('authorships', Prototyper.toAuthorshipsCollection);
        Restangular.extendCollection('institutes', Prototyper.toInstitutesCollection);
    }
})();
