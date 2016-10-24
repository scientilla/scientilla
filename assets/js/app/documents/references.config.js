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
                        researchEntity: getCurrentUser
                    }
                })
                .when("/groups/:id/references", {
                    templateUrl: "partials/reference-browsing.html",
                    controller: "ReferenceBrowsingController",
                    controllerAs: 'vm',
                    resolve: {
                        researchEntity: getCurrentGroup
                    }
                });
    }

    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: []});
    }
    
    getCurrentGroup.$inject = ['GroupsService', '$route'];

    function getCurrentGroup(GroupsService, $route) {
        var groupId = $route.current.params.id;
        return GroupsService.one(groupId).get({populate: []});
    }

})();
