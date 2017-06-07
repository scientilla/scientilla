(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardAdminTutorial', {
            templateUrl: 'partials/wizard-admin-tutorial.html',
            controller: wizardAdminTutorial,
            controllerAs: 'vm',
            bindings: {}
        });

    wizardAdminTutorial.$inject = [];

    function wizardAdminTutorial() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();