(function () {
    "use strict";
    angular.module("services").factory("DateService", DateService);

    DateService.$inject = [];

    function DateService() {
        let service = {};

        service.format = (value) => {
            return new Date(value);
        };

        return service;
    }
})();