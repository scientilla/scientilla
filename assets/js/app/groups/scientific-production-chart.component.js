(function () {
    angular
        .module('groups')
        .component('scientificProductionChart', {
            controller: controller,
            templateUrl: 'partials/scientific-production-chart.html',
            controllerAs: 'vm',
            bindings: {
                title: '@',
                data: '<',
                valueSuffix: '@?'
            }
        });

    controller.$inject = ['ChartService'];

    function controller(ChartService) {
        const vm = this;

        vm.colors = ChartService.getColors();
        vm.options = {
            chart: {
                type: 'pieChart',
                x: d => d.label,
                y: d => d.value,
                color: vm.colors,
                growOnHover: false,
                showLegend: false,
                showLabels: false,
                margin: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                tooltip: {
                    enabled: false
                }
            }
        };

        vm.selectedChart = 'pie';

        vm.select = chart => {
            vm.selectedChart = chart;
        };

        vm.$onInit = () => {
            if (vm.data.length > 15) {
                vm.selectedChart = 'list';
            }
        };

        vm.$onDestroy = () => {
            vm.data = [];
        };
    }
})();
