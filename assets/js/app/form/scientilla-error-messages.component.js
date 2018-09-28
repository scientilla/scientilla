(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaErrorMessages', {
            templateUrl: 'partials/scientilla-error-messages.html',
            controller: scientillaErrorMessages,
            controllerAs: 'vm',
            bindings: {
                errors: '<'
            }
        });

    scientillaErrorMessages.$inject = [];

    function scientillaErrorMessages() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();