/* global angular */

(function () {
    angular
        .module('errors')
        .component('error500', {
            controller: Error500Controller,
            templateUrl: 'partials/error-500.html',
            controllerAs: 'vm',
            bindings: {

            }
        });

    Error500Controller.$inject = [

    ];

    function Error500Controller() {
        const vm = this;

    }
})();
