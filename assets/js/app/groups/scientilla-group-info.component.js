(function () {
    angular
        .module('groups')
        .component('scientillaGroupInfo', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-info.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                active: '<?'
            }
        });

    controller.$inject = ['$scope', '$element', 'ISO3166', 'genders', 'ChartService'];

    function controller($scope, $element, ISO3166, genders, ChartService) {
        const vm = this;

        vm.name = 'group-info';
        vm.shouldBeReloaded = true;

        vm.charts = [];
        vm.includeSubgroups = true;
        vm.firstTimeLoaded = false;
        vm.isLoading = false;

        let includeSubgroupsWatcher;

        vm.byCountryBiggestCountry = [];
        vm.ageRangeData = [];
        vm.selectedRoles = [];
        vm.byRole = [];

        const excludeTitle = 'Click to exclude this role from the charts';
        const includeTitle = 'Click to include this role into the charts';

        let activeWatcher;

        vm.loadCharts = true;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            includeSubgroupsWatcher = $scope.$watch('vm.includeSubgroups', () => {
                vm.reload(true);
            });

            if (_.has(vm, 'active')) {
                vm.loadCharts = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', async () => {
                    vm.loadCharts = angular.copy(vm.active);

                    if (vm.active) {
                        await vm.reload(true);
                    } else {
                        vm.byCountryBiggestCountry = [];
                        vm.ageRangeData = [];
                        vm.selectedRoles = [];
                        vm.byRole = [];
                    }
                });
            }

            initCharts();
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            if (_.isFunction(includeSubgroupsWatcher)) {
                includeSubgroupsWatcher();
            }

            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
        };

        /* jshint ignore:start */
        vm.reload = async function (forced = false) {
            if (vm.isLoading || !vm.loadCharts) {
                return;
            }

            vm.isLoading = true;

            if (!vm.firstTimeLoaded) {
                forced = true;
            }

            vm.researchDomain = vm.group.getResearchDomain();
            vm.interactions = vm.group.getInteractions();

            await loadChartData(forced);

            vm.isLoading = false;

            $scope.$apply();
        };

        vm.checkSelectedRoles = (event, category) => {
            if (!_.isEmpty(vm.byRole)) {
                const role = vm.byRole.find(r => r.category === category);
                role.selected = !role.selected;
                if (role.selected) {
                    role.title = excludeTitle;
                } else {
                    role.title = includeTitle;
                }

                if (vm.byRole.filter(r => r.selected).length === 0) {
                    event.preventDefault();

                    for (const role of vm.byRole) {
                        role.selected = true;
                        role.title = includeTitle;
                    }
                }

                vm.selectedRoles = vm.byRole.filter(r => r.selected).map(r => r.category);

                vm.reload(false);
            }
        };

        vm.getTitle = (selected) => {
            if (selected) {
                return 'Click to exclude this role from the charts';
            } else {
                return 'Click to include this role into the charts'
            }
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
            'groupMembersByGenderOfRoles',
            'groupMembersByAgeRangeOfRoles',
            'groupMembersByNationalityOfRoles'
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
            'groupAndSubgroupMembersByGenderOfRoles',
            'groupAndSubgroupMembersByAgeRangeOfRoles',
            'groupAndSubgroupMembersByNationalityOfRoles',
        ];

        function getDefaultPieChartOptions() {
            return Object.assign({}, {
                chart: {
                    type: 'pieChart',
                    growOnHover: false,
                    showLegend: false,
                    showLabels: false,
                    duration: 300,
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
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
            })
        }

        function initCharts() {
            vm.colors = ChartService.getColors();
            vm.otherColor = '#cfcece';

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
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    },
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

            vm.chartByAgeRangeOptions = getDefaultPieChartOptions();
            vm.chartByBiggestCountryOptions = getDefaultPieChartOptions();
        }

        async function loadChartData(forced = false) {
            let charts = [];
            if (forced) {
                charts = vm.charts.filter(c => c.includeSubgroups === vm.includeSubgroups && c.forced === forced)
                    .map(c => c.charts[0]);
            } else {
                charts = vm.charts.filter(c =>
                    c.includeSubgroups === vm.includeSubgroups &&
                    JSON.stringify(c.roles) === JSON.stringify(vm.selectedRoles) &&
                    c.forced === forced
                ).map(c => c.charts[0]);
            }

            let total = 0;
            let byRole = [];
            let byGender = [];
            let byAgeRange = [];
            let byNationality = [];
            const defaultChartColor = '#cccccc';

            function getCountryLabel(nationality) {
                return ISO3166.getCountryName(nationality) ? ISO3166.getCountryName(nationality) : nationality;
            }

            function getPercent(numberOfMembers, total) {
                return _.round((parseInt(numberOfMembers) / total) * 100, 2);
            }

            if (_.isEmpty(charts)) {

                let options = {};

                if (forced) {
                    if (vm.includeSubgroups) {
                        options = {
                            charts: includeSubgroupsChartsAllRoles
                        };
                    } else {
                        options = {
                            charts: groupChartAllRoles,
                        };
                    }
                } else {
                    switch (true) {
                        case !_.isEmpty(vm.selectedRoles) &&
                            JSON.stringify(vm.byRole.map(r => r.category)) === JSON.stringify(vm.selectedRoles) &&
                            !vm.includeSubgroups:
                            options = {
                                charts: groupChartAllRoles,
                            };
                            break;
                        case !_.isEmpty(vm.selectedRoles) &&
                            JSON.stringify(vm.byRole.map(r => r.category)) === JSON.stringify(vm.selectedRoles) &&
                            vm.includeSubgroups:
                            options = {
                                charts: includeSubgroupsChartsAllRoles
                            };
                            break;
                        case !_.isEmpty(vm.selectedRoles) &&
                            JSON.stringify(vm.byRole.map(r => r.category)) !== JSON.stringify(vm.selectedRoles) &&
                            !vm.includeSubgroups:
                            options = {
                                charts: groupChartOfRole,
                                roles: vm.selectedRoles
                            };
                            break;
                        default:
                            options = {
                                charts: includeSubgroupsChartsOfRole,
                                roles: vm.selectedRoles
                            };
                            break;
                    }
                }

                vm.charts.push({
                    roles: vm.selectedRoles,
                    includeSubgroups: vm.includeSubgroups,
                    forced: forced,
                    charts: await vm.group.all('charts').getList(
                        Object.assign({}, { refresh: true }, options)
                    )
                });

                if (forced) {
                    charts = vm.charts.filter(c => c.includeSubgroups === vm.includeSubgroups && c.forced === forced)
                        .map(c => c.charts[0]);
                } else {
                    charts = vm.charts.filter(c =>
                        c.includeSubgroups === vm.includeSubgroups &&
                        JSON.stringify(c.roles) === JSON.stringify(vm.selectedRoles) &&
                        c.forced === forced
                    ).map(c => c.charts[0]);
                }
            }

            if (forced) {
                if (vm.includeSubgroups) {
                    total = charts[0].groupAndSubgroupMembersTotal[0].count;
                    byRole = charts[0].groupAndSubgroupMembersByRole;
                    byGender = charts[0].groupAndSubgroupMembersByGender;
                    byAgeRange = charts[0].groupAndSubgroupMembersByAgeRange[0];
                    byNationality = charts[0].groupAndSubgroupMembersByNationality;
                } else {
                    total = charts[0].groupMembersTotal[0].count;
                    byRole = charts[0].groupMembersByRole;
                    byGender = charts[0].groupMembersByGender;
                    byAgeRange = charts[0].groupMembersByAgeRange[0];
                    byNationality = charts[0].groupMembersByNationality;
                }
            } else {
                switch (true) {
                    case !_.isEmpty(vm.selectedRoles) &&
                        JSON.stringify(vm.byRole.map(r => r.category)) === JSON.stringify(vm.selectedRoles) &&
                        !vm.includeSubgroups:
                        total = charts[0].groupMembersTotal[0].count;
                        byRole = charts[0].groupMembersByRole;
                        byGender = charts[0].groupMembersByGender;
                        byAgeRange = charts[0].groupMembersByAgeRange[0];
                        byNationality = charts[0].groupMembersByNationality;
                        break;
                    case !_.isEmpty(vm.selectedRoles) &&
                        JSON.stringify(vm.byRole.map(r => r.category)) === JSON.stringify(vm.selectedRoles) &&
                        vm.includeSubgroups:
                        total = charts[0].groupAndSubgroupMembersTotal[0].count;
                        byRole = charts[0].groupAndSubgroupMembersByRole;
                        byGender = charts[0].groupAndSubgroupMembersByGender;
                        byAgeRange = charts[0].groupAndSubgroupMembersByAgeRange[0];
                        byNationality = charts[0].groupAndSubgroupMembersByNationality;
                        break;
                    case !_.isEmpty(vm.selectedRoles) &&
                        JSON.stringify(vm.byRole.map(r => r.category)) !== JSON.stringify(vm.selectedRoles) &&
                        !vm.includeSubgroups:
                        total = charts[0].groupMembersTotal[0].count;
                        byRole = charts[0].groupMembersByRole;
                        byGender = charts[0].groupMembersByGenderOfRoles;
                        byAgeRange = charts[0].groupMembersByAgeRangeOfRoles[0];
                        byNationality = charts[0].groupMembersByNationalityOfRoles;
                        break;
                    default:
                        total = charts[0].groupAndSubgroupMembersTotal[0].count;
                        byRole = charts[0].groupAndSubgroupMembersByRole;
                        byGender = charts[0].groupAndSubgroupMembersByGenderOfRoles;
                        byAgeRange = charts[0].groupAndSubgroupMembersByAgeRangeOfRoles[0];
                        byNationality = charts[0].groupAndSubgroupMembersByNationalityOfRoles;
                        break;
                }
            }

            vm.totalMembers = total;
            vm.totalMembersByRole = byRole.reduce((tot, el) => tot + parseInt(el.count), 0);

            if (JSON.stringify(byRole.map(r => r.category)) !== JSON.stringify(vm.byRole.map(r => r.category))) {
                vm.byRole = byRole.map(role => {
                    return {
                        category: role.category,
                        selected: true,
                        value: parseInt(role.count),
                        percent: _.round((parseInt(role.count) / vm.totalMembers) * 100, 2),
                        title: excludeTitle,
                        disabled: false
                    }
                });
                vm.selectedRoles = vm.byRole.filter(r => r.selected).map(r => r.category);
            }

            // Gender charts
            const genderTotal = byGender.reduce(function (accumulator, gender) {
                return accumulator + parseInt(gender.count);
            }, 0);
            vm.maleData = byGender.find(d => d.gender === 'M') || { count: 0 };
            vm.femaleData = byGender.find(d => d.gender === 'F') || { count: 0 };

            vm.chartGenderData = [];
            vm.chartGenderData.push({
                value: 'M',
                label: 'Male',
                count: vm.maleData.count,
                percentage: _.round((vm.maleData.count / genderTotal) * 100, 2)
            });
            vm.chartGenderData.push({
                value: 'F',
                label: 'Female',
                count: vm.femaleData.count,
                percentage: _.round((vm.femaleData.count / genderTotal) * 100, 2)
            });
            vm.genderTotal = genderTotal;

            // Age range chart
            let ageRangeTotal = 0;

            vm.ageRangeData = [];

            for (const label in byAgeRange) {
                ageRangeTotal += parseInt(byAgeRange[label]);
            }

            for (const label in byAgeRange) {
                if (byAgeRange[label] > 0) {
                    vm.ageRangeData.push({
                        label: label,
                        count: parseInt(byAgeRange[label]),
                        percentage: _.round((byAgeRange[label] / ageRangeTotal) * 100, 2)
                    })
                }
            }

            vm.ageRageTotal = ageRangeTotal;

            // Country charts
            const totalByCountries = byNationality.reduce(function (accumulator, nationality) {
                return accumulator + parseInt(nationality.count);
            }, 0);
            vm.totalByCountries = totalByCountries;
            vm.byCountry = _.cloneDeep(
                _.sortBy(
                    byNationality.map(data => {
                        return {
                            key: data.nationality,
                            label: getCountryLabel(data.nationality),
                            value: parseInt(data.count),
                            percent: getPercent(data.count, totalByCountries)
                        }
                    }), ['value']
                ).reverse());
            vm.totalCountries = vm.byCountry.length || 0;

            const biggestCountry = _.head(vm.byCountry);
            if (!_.isEmpty(biggestCountry)) {
                vm.byCountryBiggestCountry = [
                    {
                        key: biggestCountry.key,
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
            }

            vm.firstTimeLoaded = true;

            return Promise.resolve(1);
        }
        /* jshint ignore:end */
    }
})();