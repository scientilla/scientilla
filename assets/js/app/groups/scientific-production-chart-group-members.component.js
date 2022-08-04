(function () {
    angular
        .module('groups')
        .component('scientificProductionChartGroupMembers', {
            controller: controller,
            templateUrl: 'partials/scientific-production-chart-group-members.html',
            controllerAs: 'vm',
            bindings: {
                title: '@',
                data: '<',
                showPieChart: '<?',
                valueSuffix: '@?'
            }
        });

    controller.$inject = ['ChartService', '$scope', 'DateService'];

    function controller(ChartService, $scope, DateService) {
        const vm = this;

        const filter = items => {
            return items.filter(line => line.activeGroupMember);
        };

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
        vm.checkbox = {
            label: 'Show not active group members'
        };
        vm.format = DateService.format;
        vm.hasNotActiveGroupMembers = false;

        let checkboxWatcher;
        let dataWatcher;

        vm.select = chart => {
            vm.selectedChart = chart;
        };

        vm.$onInit = () => {
            checkboxWatcher = $scope.$watch('vm.showNotActiveGroupMembers', showNotActiveGroupMembersChange);
            dataWatcher = $scope.$watch('vm.filteredData', dataChange);

            vm.showNotActiveGroupMembers = true;


            if ((vm.data && vm.data.length > 15) || !vm.showPieChart) {
                vm.selectedChart = 'list';
            }
        };

        vm.$onDestroy = () => {
            vm.data = [];
            vm.filteredData = [];
            vm.showNotActiveGroupMembers = false;

            if (_.isFunction(checkboxWatcher)) {
                checkboxWatcher();
            }

            if (_.isFunction(dataWatcher)) {
                dataWatcher();
            }
        };

        vm.isNotActiveGroupMember = line => {
            return _.has(line, 'activeGroupMember') && !line.activeGroupMember;
        };

        const showNotActiveGroupMembersChange = () => {
            if (!vm.data) {
                return;
            }

            if (vm.showNotActiveGroupMembers) {
                vm.filteredData = [...vm.data];
            } else {
                vm.filteredData = filter([...vm.data]);
            }
        };

        const dataChange = () => {
            if (!vm.data) {
                return;
            }

            vm.hasNotActiveGroupMembers = vm.data.some(line => !line.activeGroupMember);
        };
    }
})();
