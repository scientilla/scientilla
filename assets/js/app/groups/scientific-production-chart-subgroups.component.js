(function () {
    angular
        .module('groups')
        .component('scientificProductionChartSubgroups', {
            controller: controller,
            templateUrl: 'partials/scientific-production-chart-subgroups.html',
            controllerAs: 'vm',
            bindings: {
                title: '@',
                data: '<',
                valueSuffix: '@?'
            }
        });

    controller.$inject = ['ChartService', '$scope', 'DateService'];

    function controller(ChartService, $scope, DateService) {
        const vm = this;

        const filter = items => {
            return items.filter(line =>
                (_.has(line, 'endDate') && line.endDate && moment().diff(moment(line.endDate, 'YYYY-MM-DD')) <= 0) ||
                _.isNil(line.endDate)
            );
        };

        vm.colors = ChartService.getColors();
        vm.options = {
            chart: {
                type: 'pieChart',
                x: d => d.label,
                y: d => (d.value / vm.total) * 100,
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
        vm.checkbox = {
            label: 'Show ended groups'
        };
        vm.format = DateService.format;
        vm.hasExpiredGroups = false;

        let checkboxWatcher;
        let filteredDataWatcher;
        let dataWatcher;

        vm.select = chart => {
            vm.selectedChart = chart;
        };

        vm.$onInit = () => {
            checkboxWatcher = $scope.$watch('vm.showExpiredGroups', showExpiredGroupsChange);
            filteredDataWatcher = $scope.$watch('vm.filteredData', filteredDataChange);
            dataWatcher = $scope.$watch('vm.filteredData', dataChange);

            vm.showExpiredGroups = true;

            if (vm.data && vm.data.length > 15) {
                vm.selectedChart = 'list';
            }
        };

        vm.$onDestroy = () => {
            vm.data = [];
            vm.filteredData = [];
            vm.showExpiredGroups = false;

            if (_.isFunction(checkboxWatcher)) {
                checkboxWatcher();
            }

            if (_.isFunction(filteredDataWatcher)) {
                filteredDataWatcher();
            }

            if (_.isFunction(dataWatcher)) {
                dataWatcher();
            }
        };

        vm.isExpired = line => {
            if (_.has(line, 'endDate') && line.endDate) {
                if (moment().diff(moment(line.endDate, 'YYYY-MM-DD')) > 0) {
                    return true;
                }
            }
            return false;
        };

        const showExpiredGroupsChange = () => {
            if (!vm.data) {
                return;
            }

            if (vm.showExpiredGroups) {
                vm.filteredData = [...vm.data];
            } else {
                vm.filteredData = filter([...vm.data]);
            }
        };

        const dataChange = () => {
            if (!vm.data) {
                return;
            }
            vm.hasExpiredGroups = vm.data.some(line => _.has(line, 'endDate') && line.endDate && moment().diff(moment(line.endDate, 'YYYY-MM-DD')) > 0);
        };

        const filteredDataChange = () => {
            if (!vm.filteredData) {
                return;
            }
            vm.total = vm.filteredData.reduce((previous, current) =>  parseInt(previous) + parseInt(current.value), 0);
        };
    }
})();
