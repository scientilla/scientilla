/* global angular */
(function () {
    angular
        .module('app')
        .component('overviewTab', {
            controller: controller,
            templateUrl: 'partials/overview-tab.html',
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = ['$element', 'ChartService'];

    function controller($element, ChartService) {
        const vm = this;

        vm.name = 'overview-tab';
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
            const refresh = !isMainGroup();
            vm.chartsData = await ChartService.getDocumentsOverviewChartData(vm.researchEntity, refresh);
        };

        function isMainGroup() {
            return vm.researchEntity.id === 1;
        }
        /* jshint ignore:end */
    }
})();
