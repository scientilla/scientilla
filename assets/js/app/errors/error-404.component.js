/* global angular */

(function () {
    angular
        .module('errors')
        .component('error404', {
            controller: Error404Controller,
            templateUrl: 'partials/error-404.html',
            controllerAs: 'vm',
            bindings: {

            }
        });

    Error404Controller.$inject = [

    ];

    function Error404Controller() {
        const vm = this;

    }
})();
