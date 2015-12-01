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
                .when("/groups/:id/references", {
                    templateUrl: "partials/reference-browsing.html",
                    controller: "GroupReferenceBrowsingController",
                    controllerAs: 'vm',
                    resolve: {
                        ReferencesService: RouteReferencesService,
                        group: getCurrentGroup
                    }
                })
                .when("/references/new", {
                    template: "",
                    controller: "ReferenceCreationController",
                    resolve: {
                        ReferencesService: UserReferencesService,
                        reference: newReference,
                        researchEntity: getCurrentUser
                    }
                })
                .when("/users/:id/references/new", {
                    template: "",
                    controller: "ReferenceCreationController",
                    resolve: {
                        ReferencesService: UserReferencesService,
                        reference: newReference,
                        researchEntity: getCurrentUser
                    }
                })
                .when("/groups/:id/references/new", {
                    template: "",
                    controller: "ReferenceCreationController",
                    resolve: {
                        ReferencesService: UserReferencesService,
                        reference: newGroupReference,
                        researchEntity: getCurrentGroup
                    }
                })
                .when("/references/:id", {
                    templateUrl: "partials/reference-details.html",
                    controller: "ReferenceDetailsController",
                    controllerAs: 'vm',
                    resolve: {
                        reference: getCurrentReference
                    }
                })
                .when("/references/:id/edit", {
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


    getCurrentReference.$inject = ['$route', 'Restangular'];

    function getCurrentReference($route, Restangular) {
        var referenceId = $route.current.params.id;
        return Restangular
            .one('references', referenceId)
            .get({populate: ['collaborators', 'owner', 'groupOwner', 'groupCollaborations']});
    }


    newReference.$inject = ['ReferenceServiceFactory', 'AuthService'];

    function newReference(ReferenceServiceFactory, AuthService) {
        return ReferenceServiceFactory(AuthService.userId).getNewReference();
    }

    newGroupReference.$inject = ['$routeParams'];

    function newGroupReference($routeParams) {
        //sTODO: refactor
        var groupId = $routeParams.id;
        return Scientilla.reference.getNewGroupReference(groupId);
    }

    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases']});
    }
    
    getCurrentGroup.$inject = ['GroupsService', '$route'];

    function getCurrentGroup(GroupsService, $route) {
        var groupId = $route.current.params.id;
        return GroupsService.one(groupId).get({populate: []});
    }

})();
