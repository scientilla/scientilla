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
        '$timeout',
        'ChartService'
    ];

    function controller(
        $element,
        $timeout,
        ChartService
    ) {
        const vm = this;

        vm.name = 'scientific-production';
        vm.shouldBeReloaded = true;

        let activeWatcher;
        let includeSubgroupsWatcher;

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
        };

        /* jshint ignore:start */
        vm.getData = async () => {
            return await ChartService.getScientificProductionChartData(vm.group);
        }
        /* jshint ignore:end */

        vm.reload = chartsData => {
            vm.charts = {};
            vm.colors = ChartService.getColors();

            $timeout(() => {
                if (_.isEmpty(vm.group.childGroups)) {
                    vm.charts.documentTotal = getDocumentTotalsOfGroupMembers(chartsData);
                    vm.charts.if = getIfOfGroupMembers(chartsData);
                    vm.charts.patentTotal = getPatentTotalsOfGroupMembers(chartsData);
                    vm.charts.contributionTotalCompetitiveProjects = getCompetitiveProjectsOfGroupMembers(chartsData);
                    vm.charts.contributionTotalIndustrialProjects = getIndustrialProjectsOfGroupMembers(chartsData);
                } else {
                    vm.charts.documentTotal = getDocumentTotalsOfGroup(chartsData);
                    vm.charts.if = getIfOfGroup(chartsData);
                    vm.charts.patentTotal = getPatentTotalsOfGroup(chartsData);
                    vm.charts.contributionTotalCompetitiveProjects = getCompetitiveProjectsOfGroup(chartsData);
                    vm.charts.contributionTotalIndustrialProjects = getIndustrialProjectsOfGroup(chartsData);
                }
            });
        };

        const getDocumentTotalsOfGroup = chartsData => {
            const total = chartsData.documentTotalOfSubgroups.reduce((previous, current) =>  parseInt(previous) + parseInt(current.count), 0);
            return {
                title: 'Documents by group',
                data: _.orderBy(chartsData.documentTotalOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: (parseInt(line.count) / total) * 100,
                    link: `/#/groups/${line.group_id}/documents`
                })), 'value', 'desc')
            };
        };

        const getIfOfGroup = chartsData => {
            const total = chartsData.ifOfSubgroups.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Impact factor by group',
                data: _.orderBy(chartsData.ifOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/groups/${line.group_id}/info`
                })), 'value', 'desc')
            };
        };

        const getPatentTotalsOfGroup = chartsData => {
            const total = chartsData.patentTotalOfSubgroups.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Patents by group',
                data: _.orderBy(chartsData.patentTotalOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/groups/${line.group_id}/patents`
                })), 'value', 'desc')
            };
        };

        const getCompetitiveProjectsOfGroup = chartsData => {
            const total = chartsData.contributionTotalCompetitiveProjectsOfSubgroups.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Contribution competitive projects by group',
                data: _.orderBy(chartsData.contributionTotalCompetitiveProjectsOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/groups/${line.group_id}/projects?projectType=project_competitive`
                })), 'value', 'desc')
            };
        };

        const getIndustrialProjectsOfGroup = chartsData => {
            const total = chartsData.contributionTotalIndustrialProjectsOfSubgroups.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Contribution industrial projects by group',
                data: _.orderBy(chartsData.contributionTotalIndustrialProjectsOfSubgroups.map(line => ({
                    label: line.group_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/groups/${line.group_id}/projects?projectType=project_industrial`
                })), 'value', 'desc')
            };
        };

        const getDocumentTotalsOfGroupMembers = chartsData => {
            const total = chartsData.documentTotalOfGroupMembers.reduce((previous, current) =>  parseInt(previous) + parseInt(current.count), 0);
            return {
                title: 'Documents by member',
                data: _.orderBy(chartsData.documentTotalOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: (parseInt(line.count) / total) * 100,
                    link: `/#/users/${line.user_id}/documents`
                })), 'value', 'desc')
            };
        };

        const getIfOfGroupMembers = chartsData => {
            const total = chartsData.ifOfGroupMembers.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Impact factor by member',
                data: _.orderBy(chartsData.ifOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/users/${line.user_id}/profile`
                })), 'value', 'desc')
            };
        };

        const getPatentTotalsOfGroupMembers = chartsData => {
            const total = chartsData.patentTotalOfGroupMembers.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Patents by member',
                data: _.orderBy(chartsData.patentTotalOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/users/${line.user_id}/patents`
                })), 'value', 'desc')
            };
        };

        const getCompetitiveProjectsOfGroupMembers = chartsData => {
            const total = chartsData.contributionTotalCompetitiveProjectsOfGroupMembers.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Contribution competitive projects by group members',
                data: _.orderBy(chartsData.contributionTotalCompetitiveProjectsOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/users/${line.user_id}/projects?projectType=project_competitive`
                })), 'value', 'desc')
            };
        };

        const getIndustrialProjectsOfGroupMembers = chartsData => {
            const total = chartsData.contributionTotalIndustrialProjectsOfGroupMembers.reduce((previous, current) =>  parseInt(previous) + parseInt(current.total), 0);
            return {
                title: 'Contribution industrial projects by group members',
                data: _.orderBy(chartsData.contributionTotalIndustrialProjectsOfGroupMembers.map(line => ({
                    label: line.user_name,
                    value: (parseInt(line.total) / total) * 100,
                    link: `/#/users/${line.user_id}/projects?projectType=project_industrial`
                })), 'value', 'desc')
            };
        };
    }
})();
