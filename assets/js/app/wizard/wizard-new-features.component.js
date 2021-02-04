(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardNewFeatures', {
            templateUrl: 'partials/wizard-new-features.html',
            controller: wizard,
            controllerAs: 'vm',
            bindings: {}
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