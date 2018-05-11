(function () {
    "use strict";
    angular.module("services")
        .factory("Settings", Settings);

    Settings.$inject = [
        'Restangular'
    ];

    function Settings(Restangular) {
        var settings;
        var service = {
            getSettings: getSettings
        };

        function getSettings(refresh) {
            refresh = refresh || false;
            if (settings && !refresh)
                return Promise.resolve(settings);
            var url = 'settings';
            return Restangular.one(url).get()
                .then(function(data) {
                    settings = data;
                    return settings;
                });
        }

        return service;
    }
})();