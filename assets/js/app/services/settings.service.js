(function () {
    "use strict";
    angular.module("services")
        .factory("Settings", Settings);

    Settings.$inject = [
        '$http'
    ];

    function Settings($http) {
        var settings;
        var service = {
            getSettings: getSettings
        };

        function getSettings(refresh) {
            refresh = refresh || false;
            if (settings && !refresh)
                return Promise.resolve(settings);
            var url = '/settings';
            return $http.get(url)
                .then(function(result) {
                    settings = result.data;
                    return settings;
                });
        }

        return service;
    }
})();