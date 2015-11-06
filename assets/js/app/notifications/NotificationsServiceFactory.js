(function () {
    angular.module("notifications").
            factory("NotificationsServiceFactory", NotificationsServiceFactory);

    NotificationsServiceFactory.$inject = ['Restangular'];

    function NotificationsServiceFactory(Restangular) {
        return function (userId) {
            var service = Restangular.service("notifications", Restangular.one('users', userId));

            return service;
        };
    }
}());