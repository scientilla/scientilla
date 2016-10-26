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
                    controllerAs: 'vm'
                });
    }

})();