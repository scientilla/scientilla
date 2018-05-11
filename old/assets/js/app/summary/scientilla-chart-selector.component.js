(function () {
    "use strict";

    angular
        .module('summary')
        .component('scientillaChartSelector', {
            templateUrl: 'partials/scientilla-chart-selector.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                charts: '<'
            },
        });

    controller.$inject = [
        '$scope'
    ];

    function controller($scope) {
        const vm = this;

        vm.select = select;

        vm.$onInit = () => {
            $scope.$watch('vm.charts', init);
            init();
        };

        function init() {
            if (Array.isArray(vm.charts))
                vm.selectedChart = vm.charts.find(c => c.default);
        }

        function select(chart) {
            vm.selectedChart = chart;
        }
    }
})();