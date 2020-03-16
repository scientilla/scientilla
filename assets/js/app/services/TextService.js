(function () {
    "use strict";
    angular.module("services").factory("TextService", TextService);

    TextService.$inject = [];

    function TextService() {
        let service = {};

        service.unsavedData = [];

        service.joinStrings = (strings = [], seperator = ', ') => {
            return _.filter(strings).join(seperator);
        };

        return service;
    }
})();