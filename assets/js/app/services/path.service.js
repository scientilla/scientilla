(function () {
    "use strict";
    angular.module("services")
        .factory("path", path);

    path.$inject = [
        '$location',
        'EventsService',
        '$route',
        'AuthService',
        'userConstants'
    ];

    function path($location, EventsService, $route, AuthService, userConstants) {
        const current = $location.url();
        const next = current === '/unavailable' ? '/' : current;
        const service = {
            current: current,
            goTo: goTo,
            getUrlPath: getUrlPath,
            locationPath: locationPath
        };

        EventsService.subscribe(service, EventsService.AUTH_LOGIN, () => {
            let rootPath = '/';
            if (AuthService.user.role === userConstants.role.EVALUATOR)
                rootPath = '/groups/1';

            return ['/login', ''].includes(current) ? goTo(rootPath) : goTo(next);
        });

        function goTo(path) {
            $location.path(path);
            $route.reload();
        }

        function getUrlPath(url) {
            return url.replace(/https?:\/\/[^\/]+\//, "");
        }

        function locationPath(){
            return $location.$$path;
        }

        return service;
    }
})();