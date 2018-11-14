(function () {
    "use strict";
    angular.module("services").factory("FormService", FormService);

    FormService.$inject = [];

    function FormService() {
        let service = {};

        service.unsavedData = [];

        service.setUnsavedData = function(form, value) {
            service.unsavedData[form] = value;
        };

        service.getUnsavedData = function(form) {
            if (service.unsavedData[form]) {
                return service.unsavedData[form];
            } else {
                return false;
            }
        };

        return service;
    }
})();