(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardTutorial', {
            templateUrl: 'partials/wizard-tutorial.html',
            controller: wizardTutorial,
            controllerAs: 'vm',
            bindings: {}
        });

    wizardTutorial.$inject = [];

    function wizardTutorial() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();