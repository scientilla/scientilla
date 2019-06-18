(function () {
    "use strict";
    angular.module("services")
        .factory("Settings", Settings);

    Settings.$inject = [
        'Restangular'
    ];

    function Settings(Restangular) {
        let settings;
        return {
            getSettings: getSettings
        };

        function getSettings(refresh = false) {
            if (settings && !refresh)
                return Promise.resolve(settings);

            return Restangular.one('settings').get()
                .then(data => {
                    settings = data;
                    return settings;
                });
        }
    }
})();