(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaErrorMessages', {
            templateUrl: 'partials/scientilla-error-messages.html',
            controller: scientillaErrorMessages,
            controllerAs: 'vm',
            bindings: {
                error: '<'
            }
        });

    scientillaErrorMessages.$inject = [];

    function scientillaErrorMessages() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();