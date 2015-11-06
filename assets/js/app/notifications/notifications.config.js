(function () {
    angular
            .module('notifications')
            .config(configure);

    configure.$inject = ['$routeProvider'];

    function configure($routeProvider) {
        $routeProvider
                .when("/users/:id/notifications", {
                    templateUrl: "partials/notification-browsing.html",
                    controller: "NotificationBrowsingController",
                    controllerAs: 'vm',
                    resolve: {
                        NotificationsService: NotificationsService,
                        user: getCurrentUser
                    },
                });
    }

    NotificationsService.$inject = ['NotificationsServiceFactory', 'AuthService', '$route'];
    
    function NotificationsService(NotificationsServiceFactory, AuthService, $route) {
        return NotificationsServiceFactory($route.current.params.id);
    }
    
    
    //sTODO: move this function to the UsersService
    getCurrentUser.$inject = ['UsersService', '$route'];

    function getCurrentUser(UsersService, $route) {
        var userId = $route.current.params.id;
        return UsersService.one(userId).get({populate: ['collaborations', 'aliases']});
    }
    
})();