(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardWelcome', {
            templateUrl: 'partials/wizard-welcome.html',
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