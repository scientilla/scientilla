(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardScientificProduction', {
            templateUrl: 'partials/wizard-scientific-production.html',
            controller: wizard,
            controllerAs: 'vm',
            bindings: {
            }
        });

    wizard.$inject = [];

    function wizard() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();