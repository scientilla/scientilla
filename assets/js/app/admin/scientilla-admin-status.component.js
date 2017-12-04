(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminStatus', {
            templateUrl: 'partials/scientilla-admin-status.html',
            controller: scientillaAdminStatus,
            controllerAs: 'vm',
            bindings: {}
        });

    scientillaAdminStatus.$inject = [
        'Restangular',
        'AuthService'
    ];

    function scientillaAdminStatus(Restangular, AuthService) {
        const vm = this;
        vm.isAvailable = isAvailable;
        vm.enable = enable;
        vm.disable = disable;

        vm.$onInit = function () {
        };

        function isAvailable() {
            return AuthService.isAvailable;
        }

        function enable() {
            Restangular.one('status', 'enable').customPUT()
                .then(() => AuthService.isAvailable = true);
        }

        function disable() {
            Restangular.one('status', 'disable').customPUT()
                .then(() => AuthService.isAvailable = false);
        }

    }

})();