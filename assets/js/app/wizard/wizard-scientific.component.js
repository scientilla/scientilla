(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardScientific', {
            templateUrl: 'partials/wizard-scientific.html',
            controller: scientific,
            controllerAs: 'vm',
            bindings: {
            }
        });

    scientific.$inject = [];

    function scientific() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();