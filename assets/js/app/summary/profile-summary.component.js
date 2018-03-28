(function () {
        "use strict";

        angular.module('summary')
            .component('profileSummary', {
                templateUrl: 'partials/profile-summary.html',
                controller: ProfileSummaryComponent,
                controllerAs: 'vm'
            });

        ProfileSummaryComponent.$inject = [
            'context'
        ];

        function ProfileSummaryComponent(context) {
            const vm = this;
            const researchEntity = context.getResearchEntity();

            vm.lastRefresh = new Date();
            vm.isLoading = false;

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;
            vm.changeTab = changeTab;
            vm.registerTab = registerTab;
            vm.unregisterTab = unregisterTab;

            const tabs = [];

            /* jshint ignore:start */
            vm.$onInit = async () => {
                const refresh = !isMainGroup();
                await request(refresh);
            };

            async function recalculate() {
                vm.isLoading = true;
                await request(true);
                reloadTabs();
                vm.isLoading = false;
            }

            async function request(refresh) {
                const res = await researchEntity.all('charts').getList({refresh: !!refresh});
                vm.chartsData = res[0];
                if (vm.chartsData.chartDataDate && vm.chartsData.chartDataDate[0].max)
                    vm.lastRefresh = new Date(vm.chartsData.chartDataDate[0].max);
            }

            /* jshint ignore:end */

            function isMainGroup() {
                return researchEntity.id === 1;
            }

            function changeTab(tabName) {
                if (tabs.find(t => t.name === tabName))
                    tabs.find(t => t.name === tabName).reload(vm.chartsData);
            }

            function reloadTabs() {
                tabs.forEach(t => t.reload(vm.chartsData));
            }

            function registerTab(tab) {
                tabs.push(tab);
            }

            function unregisterTab(tab) {
                _.remove(tabs, tab);
            }

        }
    }

)();