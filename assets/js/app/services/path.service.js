(function () {
    "use strict";
    angular.module("services")
        .factory("path", path);

    path.$inject = [
        '$location',
        'EventsService',
        '$route'
    ];

    function path($location, EventsService, $route) {
        var current =  $location.url();
        var service = {
            current: current,
            goTo: goTo,
            getUrlPath: getUrlPath
        };

        EventsService.subscribe(service, EventsService.AUTH_LOGIN,
            () => current !== '/login' ? goTo(current) : goTo('/')
        );

        function goTo(path) {
            $location.path(path);
            $route.reload();
        }

        function getUrlPath(url) {
            return url.replace(/https?:\/\/[^\/]+\//, "");
        }

        return service;
    }
})();