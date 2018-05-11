(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardSummaryOverview', {
            templateUrl: 'partials/wizard-summary-overview.html',
            controller: controller,
            controllerAs: 'vm'
        });

    controller.$inject = [];

    function controller() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.$onDestroy = function () {
        };
    }

})();