(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardSelectScientificProduction', {
            templateUrl: 'partials/wizard-select-scientific-production.html',
            controller: wizard,
            controllerAs: 'vm',
            bindings: {
                user: '=',
                chooseType: '&'
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