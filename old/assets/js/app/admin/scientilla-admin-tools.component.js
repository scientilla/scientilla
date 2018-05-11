(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminTools', {
            templateUrl: 'partials/scientilla-admin-tools.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
    ];

    function controller() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();