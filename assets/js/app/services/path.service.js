(function () {
    "use strict";
    angular.module("services")
        .factory("path", path);

    path.$inject = [
        '$location'
    ];

    function path($location) {
        var current = '/';
        var service = {
            current: current,
            goTo: goTo
        };

        function goTo(path) {
            // service.current = path;
            $location.path(path);
        }

        return service;
    }
})();