/* global angular */

(function () {
    angular
        .module('errors')
        .component('error403', {
            controller: Error403Controller,
            templateUrl: 'partials/error-403.html',
            controllerAs: 'vm',
            bindings: {

            }
        });

    Error403Controller.$inject = [

    ];

    function Error403Controller() {
        const vm = this;

    }
})();
