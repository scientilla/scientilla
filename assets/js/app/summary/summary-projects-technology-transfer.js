(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryProjectsTechnologyTransfer', {
            templateUrl: 'partials/summary-projects-technology-transfer.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = [
        'context',
        'ChartService',
        '$timeout',
        '$element'
    ];

    function controller(context, ChartService, $timeout, $element) {
        const vm = this;

        vm.name = 'projectsTechnologyTransfer';
        vm.shouldBeReloaded = true;

        vm.charts = {};

        vm.$onInit = () => {
            //vm.subResearchEntity = context.getSubResearchEntity();

            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.getData = async () => {
            return await ChartService.getProjectsAndPatentsChartData(vm.researchEntity);
        }
        /* jshint ignore:end */

        vm.reload = chartsData => {
            vm.charts = {};

            $timeout(() => {
                vm.charts.patentsByYear = ChartService.getPatentsByYear(chartsData);
                vm.charts.projectsByYear = ChartService.getProjectsByYear(chartsData);
            });
        };

    }
})();
