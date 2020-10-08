/* global angular */
(function () {
    angular
        .module('app')
        .component('metricsTab', {
            controller: controller,
            templateUrl: 'partials/metrics-tab.html',
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = ['$element', 'ChartService'];

    function controller($element, ChartService) {
        const vm = this;

        vm.name = 'metrics-tab';
        vm.shouldBeReloaded = true;

        vm.chartsData = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.reload = async function () {
            vm.chartsData = await ChartService.getData(vm.researchEntity);
        };
        /* jshint ignore:end */
    }
})();
