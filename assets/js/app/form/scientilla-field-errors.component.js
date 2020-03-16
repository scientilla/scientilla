(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaFieldErrors', {
            templateUrl: 'partials/scientilla-field-errors.html',
            controller: scientillaFieldErrors,
            controllerAs: 'vm',
            bindings: {
                errors: '<'
            }
        });

    scientillaFieldErrors.$inject = [];

    function scientillaFieldErrors() {
        const vm = this;

        vm.$onInit = function () {

        };
    }

})();