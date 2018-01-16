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

            vm.refresh = false;
            vm.lastRefresh = new Date();

            vm.recalculate = recalculate;
            vm.changeTab = changeTab;
            vm.registerTab = registerTab;
            vm.unregisterTab = unregisterTab;

            const tabs = [];

            /* jshint ignore:start */
            vm.$onInit = async () => {
                await request();
            };

            async function recalculate() {
                vm.refresh = true;
                await request();
                reloadTabs();
                vm.refresh = false;
            }

            async function request() {
                const res = await researchEntity.all('charts').getList({refresh: vm.refresh});
                vm.chartsData = res[0];
                if (vm.chartsData.chartDataDate)
                    vm.lastRefresh = new Date(vm.chartsData.chartDataDate[0].max);
            }

            /* jshint ignore:end */

            function changeTab(tabName) {
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