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
        const current =  $location.url();
        const next = current === '/unavailable' ? '/' : current;
        const service = {
            current: current,
            goTo: goTo,
            getUrlPath: getUrlPath
        };

        EventsService.subscribe(service, EventsService.AUTH_LOGIN,
            () => current === '/login' ? goTo('/') : goTo(next)
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