(function () {
    'use strict';
    angular.module('services').factory('MobileMenuService', MobileMenuService);

    MobileMenuService.$inject = [];

    function MobileMenuService() {
        const service = {};

        service.isOpen = false;

        service.open = function() {
            service.isOpen = true;
        };

        service.close = function() {
            service.isOpen = false;
        };

        service.toggle = function() {
            service.isOpen = !service.isOpen;
        };

        return service;
    }
})();