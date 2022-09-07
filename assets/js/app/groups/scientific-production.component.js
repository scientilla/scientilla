(function () {
    angular
        .module('groups')
        .component('scientificProduction', {
            controller: controller,
            templateUrl: 'partials/scientific-production.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                active: '<?'
            }
        });

    controller.$inject = [
        '$element',
        'ChartService'
    ];

    function controller(
        $element,
        ChartService
    ) {
        const vm = this;

        vm.name = 'scientific-production';
        vm.shouldBeReloaded = true;

        let activeWatcher;
        let includeSubgroupsWatcher;

        vm.charts = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
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

            vm.charts = false;
        };

        /* jshint ignore:start */
        vm.getData = async () => {
            return await ChartService.getScientificProductionChartData(vm.group);
        }
        /* jshint ignore:end */

        vm.reload = chartsData => {
            vm.colors = ChartService.getColors();

            if (vm.group.childGroups.length > 0) {
                vm.charts.documentTotal = getDocumentTotalsOfGroup(chartsData);
                vm.charts.if = getIfOfGroup(chartsData);
                vm.charts.patentTotal = getPatentTotalsOfGroup(chartsData);
                vm.charts.contributionTotalCompetitiveProjects = getCompetitiveProjectsOfGroup(chartsData);
                vm.charts.contributionTotalIndustrialProjects = getIndustrialProjectsOfGroup(chartsData);
            } else {
                vm.charts.documentTotal = getDocumentTotalsOfGroupMembers(chartsData);
                vm.charts.if = getIfOfGroupMembers(chartsData);
                vm.charts.patentTotal = getPatentTotalsOfGroupMembers(chartsData);
                vm.charts.contributionTotalCompetitiveProjects = getCompetitiveProjectsOfGroupMembers(chartsData);
                vm.charts.contributionTotalIndustrialProjects = getIndustrialProjectsOfGroupMembers(chartsData);
            }
        };

        const getDocumentTotalsOfGroup = chartsData => {
            return {
                title: 'Documents by group',
                data: _.orderBy(chartsData.documentTotalOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: parseFloat(line.percentage),
                    link: `/#/groups/${line.group_id}/documents`,
                    endDate: line.group_end_date
                })), 'value', 'desc')
            };
        };

        const getIfOfGroup = chartsData => {
            return {
                title: 'Impact factor by group',
                data: _.orderBy(chartsData.ifOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: parseFloat(line.percentage),
                    link: `/#/groups/${line.group_id}/info`,
                    endDate: line.group_end_date
                })), 'value', 'desc')
            };
        };

        const getPatentTotalsOfGroup = chartsData => {
            return {
                title: 'Patents by group',
                data: _.orderBy(chartsData.patentTotalOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: parseFloat(line.percentage),
                    link: `/#/groups/${line.group_id}/patents`,
                    endDate: line.group_end_date
                })), 'value', 'desc')
            };
        };

        const getCompetitiveProjectsOfGroup = chartsData => {
            return {
                title: 'Contribution competitive projects by group',
                data: _.orderBy(chartsData.contributionTotalCompetitiveProjectsOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: parseFloat(line.percentage),
                    link: `/#/groups/${line.group_id}/projects?projectType=project_competitive`,
                    endDate: line.group_end_date
                })), 'value', 'desc')
            };
        };

        const getIndustrialProjectsOfGroup = chartsData => {
            return {
                title: 'Contribution industrial projects by group',
                data: _.orderBy(chartsData.contributionTotalIndustrialProjectsOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: parseFloat(line.percentage),
                    link: `/#/groups/${line.group_id}/projects?projectType=project_industrial`,
                    endDate: line.group_end_date
                })), 'value', 'desc')
            };
        };

        const getDocumentTotalsOfGroupMembers = chartsData => {
            return {
                title: 'Documents by member',
                data: _.orderBy(chartsData.documentTotalOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: parseFloat(line.percentage),
                    activeGroupMember: line.active_group_member,
                    link: `/#/users/${line.user_id}/documents`
                })), 'value', 'desc')
            };
        };

        const getIfOfGroupMembers = chartsData => {
            return {
                title: 'Impact factor by member',
                data: _.orderBy(chartsData.ifOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: parseFloat(line.percentage),
                    activeGroupMember: line.active_group_member,
                    link: `/#/users/${line.user_id}/profile`
                })), 'value', 'desc')
            };
        };

        const getPatentTotalsOfGroupMembers = chartsData => {
            return {
                title: 'Patents by member',
                data: _.orderBy(chartsData.patentTotalOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: parseFloat(line.percentage),
                    activeGroupMember: line.active_group_member,
                    link: `/#/users/${line.user_id}/patents`
                })), 'value', 'desc')
            };
        };

        const getCompetitiveProjectsOfGroupMembers = chartsData => {
            return {
                title: 'Contribution competitive projects by group members',
                data: _.orderBy(chartsData.contributionTotalCompetitiveProjectsOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: parseFloat(line.percentage),
                    activeGroupMember: line.active_group_member,
                    link: `/#/users/${line.user_id}/projects?projectType=project_competitive`
                })), 'value', 'desc')
            };
        };

        const getIndustrialProjectsOfGroupMembers = chartsData => {
            return {
                title: 'Contribution industrial projects by group members',
                data: _.orderBy(chartsData.contributionTotalIndustrialProjectsOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: parseFloat(line.percentage),
                    activeGroupMember: line.active_group_member,
                    link: `/#/users/${line.user_id}/projects?projectType=project_industrial`
                })), 'value', 'desc')
            };
        };
    }
})();
