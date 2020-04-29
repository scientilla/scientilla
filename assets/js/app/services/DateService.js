(function () {
    "use strict";
    angular.module("services").factory("DateService", DateService);

    DateService.$inject = [];

    function DateService() {
        let service = {};

        service.format = (value) => {
            return new Date(value);
        };

        service.isFuture = (value) => {
            const now = new Date();
            value = new Date(value);

            if (value < now) {
                return false;
            }

            return true;
        };

        return service;
    }
})();