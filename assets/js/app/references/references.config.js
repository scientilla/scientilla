(function () {
    angular
            .module('references')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/users/:id/references", {
                    templateUrl: "partials/reference-browsing.html",
                    controller: "ReferenceBrowsingController",
                    controllerAs: 'vm',
                    resolve: {
                        ReferencesService: RouteReferencesService,
                        user: getCurrentUser
                    }
                })
                .when("/references/new", {
                    template: "",
                    controller: "ReferenceCreationController",
                    resolve: {
                        ReferencesService: UserReferencesService,
                        reference: newReference
                    }
                })
                .when("/references/:id", {
                    templateUrl: "partials/reference-form.html",
                    controller: "ReferenceFormController",
                    controllerAs: 'vm',
                    resolve: {
                        ReferencesService: UserReferencesService
                    }
                });
    }

    RouteReferencesService.$inject = ['ReferenceServiceFactory', '$route'];

    function RouteReferencesService(ReferenceServiceFactory, $route) {
        return ReferenceServiceFactory($route.current.params.id);
    }


    UserReferencesService.$inject = ['ReferenceServiceFactory', 'AuthService'];

    function UserReferencesService(ReferenceServiceFactory, AuthService) {
        return ReferenceServiceFactory(AuthService.userId);
    }


    UserReferencesService.$inject = ['ReferenceServiceFactory', 'AuthService', '$route', 'Restangular'];

    function currentReference(ReferenceServiceFactory, AuthService, $route, Restangular) {
        var referenceId = $route.current.params.id;
        var userId = AuthService.userId;
        return ReferenceServiceFactory(AuthService.userId).one(referenceId).getList().$object;
    }


    newReference.$inject = ['ReferenceServiceFactory', 'AuthService'];

    function newReference(ReferenceServiceFactory, AuthService) {
        return ReferenceServiceFactory(AuthService.userId).getNewReference();
    }

    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases']});
    }

})();
