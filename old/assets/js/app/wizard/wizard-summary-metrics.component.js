(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardSummaryMetrics', {
            templateUrl: 'partials/wizard-summary-metrics.html',
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