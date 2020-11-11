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

    controller.$inject = ['$scope', '$element', 'ISO3166', 'genders', 'ChartService'];

    function controller($scope, $element, ISO3166, genders, ChartService) {
        const vm = this;

        vm.name = 'group-info';
        vm.shouldBeReloaded = true;

        vm.charts = [];
        vm.includeSubgroups = true;
        vm.isLoadingCharts = false;
        vm.isLoading = false;

        let includeSubgroupsWatcher;
        let roleWatcher;
        let options = {};

        const defaultRole = 'all';

        vm.role = defaultRole;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            includeSubgroupsWatcher = $scope.$watch('vm.includeSubgroups', () => {
                vm.role = defaultRole;
                vm.reload();
            });

            roleWatcher = $scope.$watch('vm.role', () => {
                vm.reload();
            });
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            if (_.isFunction(includeSubgroupsWatcher)) {
                includeSubgroupsWatcher();
            }

            if (_.isFunction(roleWatcher)) {
                roleWatcher();
            }
        };

        /* jshint ignore:start */
        vm.reload = async function () {

            if (vm.isLoadingCharts) {
                return;
            }

            switch (true) {
                case vm.role === defaultRole && !vm.includeSubgroups:
                    options = {
                        charts: groupChartAllRoles,
                    };
                    break;
                case vm.role !== defaultRole && vm.includeSubgroups:
                    options = {
                        charts: includeSubgroupsChartsOfRole,
                        role: vm.role
                    };
                    break;
                case vm.role !== defaultRole && !vm.includeSubgroups:
                    options = {
                        charts: groupChartOfRole,
                        role: vm.role
                    };
                    break;
                default:
                    options = {
                        charts: charts = includeSubgroupsChartsAllRoles
                    };
                    break;
            }

            vm.researchDomain = vm.group.getResearchDomain();
            vm.interactions = vm.group.getInteractions();

            await initChart();
        };

        let charts = [];
        const groupChartAllRoles = [
            'groupMembersTotal',
            'groupMembersByRole',
            'groupMembersByGender',
            'groupMembersByAgeRange',
            'groupMembersByNationality'
        ];
        const groupChartOfRole = [
            'groupMembersTotal',
            'groupMembersByRole',
            'groupMembersByGenderOfRole',
            'groupMembersByAgeRangeOfRole',
            'groupMembersByNationalityOfRole'
        ];
        const includeSubgroupsChartsAllRoles = [
            'groupAndSubgroupMembersTotal',
            'groupAndSubgroupMembersByRole',
            'groupAndSubgroupMembersByGender',
            'groupAndSubgroupMembersByAgeRange',
            'groupAndSubgroupMembersByNationality'
        ];
        const includeSubgroupsChartsOfRole = [
            'groupAndSubgroupMembersTotal',
            'groupAndSubgroupMembersByRole',
            'groupAndSubgroupMembersByGenderOfRole',
            'groupAndSubgroupMembersByAgeRangeOfRole',
            'groupAndSubgroupMembersByNationalityOfRole'
        ];

        async function initChart() {

            let charts = vm.charts.filter(c => {
                return c.includeGroups === vm.includeSubgroups && c.role === vm.role
                })
                .map(c => c.charts[0]);

            let total = 0;
            let byRole = [];
            let byGender = [];
            let byAgeRange = [];
            let byNationality = [];
            const defaultChartColor = '#cccccc';

            vm.isLoading = true;

            function getCountryLabel(nationality) {
                return ISO3166.getCountryName(nationality) ? ISO3166.getCountryName(nationality) : nationality;
            }

            function getPercent(numberOfMembers, total) {
                return _.round((parseInt(numberOfMembers) / total) * 100, 2);
            }

            if (_.isEmpty(charts)) {
                vm.isLoadingCharts = true;
                vm.charts.push({
                    role: vm.role,
                    includeGroups: vm.includeSubgroups,
                    charts: await vm.group.all('charts').getList(Object.assign(
                        {},
                        {
                            refresh: true
                        }, options)
                    )
                });
                vm.isLoadingCharts = false;

                charts = vm.charts.filter(c => {
                        return c.includeGroups === vm.includeSubgroups && c.role === vm.role
                    })
                    .map(c => c.charts[0]);
            }

            switch (true) {
                case vm.role === defaultRole && !vm.includeSubgroups:
                    total = charts[0].groupMembersTotal[0].count;
                    byRole = charts[0].groupMembersByRole;
                    byGender = charts[0].groupMembersByGender;
                    byAgeRange = charts[0].groupMembersByAgeRange[0];
                    byNationality = charts[0].groupMembersByNationality;
                    break;
                case vm.role !== defaultRole && vm.includeSubgroups:
                    total = charts[0].groupAndSubgroupMembersTotal[0].count;;
                    byRole = charts[0].groupAndSubgroupMembersByRole;
                    byGender = charts[0].groupAndSubgroupMembersByGenderOfRole;
                    byAgeRange = charts[0].groupAndSubgroupMembersByAgeRangeOfRole[0];
                    byNationality = charts[0].groupAndSubgroupMembersByNationalityOfRole;
                    break;
                case vm.role !== defaultRole && !vm.includeSubgroups:
                    total = charts[0].groupMembersTotal[0].count;;
                    byRole = charts[0].groupMembersByRole;
                    byGender = charts[0].groupMembersByGenderOfRole;
                    byAgeRange = charts[0].groupMembersByAgeRangeOfRole[0];
                    byNationality = charts[0].groupMembersByNationalityOfRole;
                    break;
                default:
                    total = charts[0].groupAndSubgroupMembersTotal[0].count;;
                    byRole = charts[0].groupAndSubgroupMembersByRole;
                    byGender = charts[0].groupAndSubgroupMembersByGender;
                    byAgeRange = charts[0].groupAndSubgroupMembersByAgeRange[0];
                    byNationality = charts[0].groupAndSubgroupMembersByNationality;
                    break;
            }

            vm.totalMembers = total;
            vm.totalMembersByRole = byRole.reduce((tot, el) => tot + parseInt(el.count), 0);

            vm.byRole = byRole.map(role => {
                return {
                    category: role.category,
                    value: parseInt(role.count),
                    percent: _.round((parseInt(role.count) / vm.totalMembers) * 100, 2)
                }
            });

            vm.roles = _.sortBy(vm.byRole.map(role => {
                return {
                    label: role.category,
                    value: role.category
                };
            }), 'label');

            vm.roles.unshift({
                label: 'All',
                value: defaultRole
            });

            vm.selectStructure = {
                label: 'Select role:',
                values: vm.roles
            };

            vm.colors = ChartService.getColors();
            vm.otherColor = '#cfcece';

            // Gender charts
            vm.donutChartOptions = {
                chart: {
                    type: 'pieChart',
                    donut: true,
                    donutRatio: 0.7,
                    labelThreshold: 0.01,
                    growOnHover: false,
                    showLegend: false,
                    showLabels: false,
                    duration: 300,
                    margin: 0,
                    tooltip: {
                        enabled: false
                    },
                    color: function(d, i) {
                        return d.color || vm.colors[i % vm.colors.length]
                    },
                    x: d => genders[d.gender],
                    y: d => d.count,
                }
            };

            const genderTotal = byGender.reduce(function (accumulator, gender) {
                return accumulator + parseInt(gender.count);
            }, 0);
            vm.maleData = byGender.find(d => d.gender === 'M') || { count: 0 };
            vm.maleData.percentage = _.round((vm.maleData.count / genderTotal) * 100, 2);
            vm.femaleData = byGender.find(d => d.gender === 'F') || { count: 0 };
            vm.femaleData.percentage = _.round((vm.femaleData.count / genderTotal) * 100, 2);

            vm.genderTotal = genderTotal;

            vm.chartMaleData = [];
            vm.chartMaleData.push({
                gender: 'Male',
                count: vm.maleData.count,
                color: vm.colors[0]
            });
            vm.chartMaleData.push({
                gender: 'Female',
                count: vm.femaleData.count,
                color: defaultChartColor
            });

            vm.chartFemaleData = [];
            vm.chartFemaleData.push({
                gender: 'Female',
                count: vm.femaleData.count,
                color: vm.colors[0]
            });
            vm.chartFemaleData.push({
                gender: 'Male',
                count: vm.maleData.count,
                color: defaultChartColor
            });

            // Age range chart
            let ageRangeTotal = 0;
            const ageRangeData = [];
            for (const label in byAgeRange) {
                ageRangeTotal += parseInt(byAgeRange[label]);
            }

            for (const label in byAgeRange) {
                if (byAgeRange[label] > 0) {
                    ageRangeData.push({
                        label: label,
                        count: parseInt(byAgeRange[label]),
                        percentage: _.round((byAgeRange[label] / ageRangeTotal) * 100, 2)
                    })
                }
            }

            vm.ageRageTotal = ageRangeTotal;

            vm.chartByAgeRange = {
                title: 'Age ranges',
                data: ageRangeData,
                options: {
                    chart: {
                        type: 'pieChart',
                        growOnHover: false,
                        showLegend: false,
                        showLabels: false,
                        duration: 300,
                        margin: 0,
                        tooltip: {
                            enabled: false
                        },
                        color: function(d, i) {
                            return vm.colors[i % vm.colors.length]
                        },
                        x: d => d.label,
                        y: d => d.count,
                        valueFormat: d => d3.format('')(d)
                    }
                }
            };

            // Country charts
            const totalByCountries = byNationality.reduce(function (accumulator, nationality) {
                return accumulator + parseInt(nationality.count);
            }, 0);
            vm.totalByCountries = totalByCountries;
            vm.byCountry = _.cloneDeep(
                _.sortBy(
                    byNationality.map(data => {
                        return {
                            label: getCountryLabel(data.nationality),
                            value: parseInt(data.count),
                            percent: getPercent(data.count, totalByCountries)
                        }
                    }), ['value']
                ).reverse());
            vm.totalCountries = vm.byCountry.length || 0;

            const biggestCountry = _.head(vm.byCountry);
            const byCountryBiggestCountry = [
                {
                    label: biggestCountry.label,
                    count: parseInt(biggestCountry.value),
                    percentage: getPercent(biggestCountry.value, totalByCountries),
                    color: vm.colors[0]
                }, {
                    label: 'Other countries',
                    count: totalByCountries - biggestCountry.value,
                    percentage: getPercent(totalByCountries - biggestCountry.value, totalByCountries),
                    color: defaultChartColor
                }
            ];

            vm.chartByBiggestCountry= {
                title: 'Nationalities',
                data: byCountryBiggestCountry,
                options: {
                    chart: {
                        type: 'pieChart',
                        labelThreshold: 0.02,
                        growOnHover: false,
                        showLegend: false,
                        showLabels: false,
                        duration: 300,
                        margin: 0,
                        tooltip: {
                            enabled: false
                        },
                        color: function(d,i){
                            return d.color || vm.colors[i % vm.colors.length]
                        },
                        x: d => d.label,
                        y: d => d.count,
                        valueFormat: d => d3.format('')(d),
                    }
                }
            };

            vm.isLoading = false;
        }

        /* jshint ignore:end */
    }
})();