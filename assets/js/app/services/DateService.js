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

        service.isBefore2015 = (value) => {
            const is2015 = Date.parse('2015-01-01');
            value = new Date(value);

            if (value < is2015) {
                return true;
            }

            return false;
        };

        return service;
    }
})();