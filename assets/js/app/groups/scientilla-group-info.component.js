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

        vm.$onInit = function () {
            vm.researchDomain = vm.group.getResearchDomain();
            vm.interactions = vm.group.getInteractions();

            vm.chart = {
                title: 'Members',
                data: getMembersChartData(),
                options: {
                    chart: {
                        type: 'pieChart',
                        x: d => d.type,
                        y: d => d.value,
                        labelThreshold: 0.02,
                        labelSunbeamLayout: true,
                        legend: {
                            margin: {
                                top: 5,
                                right: 35,
                                bottom: 15,
                                left: 15
                            }
                        },
                        height: 500,
                        width: 600,
                        duration: 300,
                        valueFormat: d => d3.format('')(d)
                    }
                }
            };
        };


        function getMembersChartData() {
            const members = vm.group.getActiveMembers();

            return members.reduce((res, m) => {
                const datum = res.find(r => r.type === m.jobTitle);
                if (datum)
                    datum.value += 1;
                else {
                    res.push({
                        type: m.jobTitle,
                        value: 1
                    });
                }
                return res;
            }, []);
        }


    }
})();