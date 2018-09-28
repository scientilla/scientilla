(function () {
    angular
        .module('groups')
        .component('scientillaGroupInfo', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-info.html',
            controllerAs: 'vm',
            bindings: {
                group: '<'
            }
        });

    controller.$inject = [];

    function controller() {
        const vm = this;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchDomain = vm.group.getResearchDomain();
            vm.interactions = vm.group.getInteractions();
            await initChart();
        };

        async function initChart() {
            const charts = await vm.group.all('charts').getList({
                refresh: true,
                charts: ['groupMembersByRole']
            });
            const groupMembersByRole = charts[0].groupMembersByRole;

            vm.totalMembers = groupMembersByRole.reduce((tot, el) => tot + el.value, 0);

            vm.chart = {
                title: 'Members',
                data: groupMembersByRole,
                options: {
                    chart: {
                        type: 'pieChart',
                        legendPosition: 'top',
                        labelThreshold: 0.02,
                        labelSunbeamLayout: true,
                        duration: 300,
                        x: d => d.role,
                        y: d => d.value,
                        valueFormat: d => d3.format('')(d)
                    }
                }
            };
        }

        /* jshint ignore:end */
    }
})();