(function () {
    angular
            .module('external')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/users/:id/external", {
                    templateUrl: "partials/external-browsing.html",
                    controller: "ExternalBrowsingController",
                    controllerAs: 'vm',
                    resolve: {
//                        user: getCurrentUser
                    }
                });
    }

    
    
    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: []});
    }
    
})();