/* global angular */
(function () {
        "use strict";

        angular.module('summary')
            .component('profileSummary', {
                templateUrl: 'partials/profile-summary.html',
                controller: ProfileSummaryComponent,
                controllerAs: 'vm'
            });

        ProfileSummaryComponent.$inject = [
            'context',
            '$scope',
            '$controller'
        ];

        function ProfileSummaryComponent(context, $scope, $controller) {
            const vm = this;
            angular.extend(vm, $controller('SummaryInterfaceController', {$scope: $scope}));
            let subResearchEntity;

            vm.lastRefresh = new Date();
            vm.isLoading = false;

            vm.isMainGroup = isMainGroup;
            vm.recalculate = recalculate;

            /* jshint ignore:start */
            vm.$onInit = async () => {
                subResearchEntity = context.getSubResearchEntity();

                const refresh = !isMainGroup();
                await request(refresh);
                if (!$scope.$$phase)
                    $scope.$apply();
            };

            async function recalculate() {
                vm.isLoading = true;
                await request(true);
                vm.reloadTabs(vm.chartsData);
                vm.isLoading = false;
            }

            async function request(refresh) {
                vm.chartsData = await vm.getChartsData(subResearchEntity, refresh);
                if (vm.chartsData.chartDataDate && vm.chartsData.chartDataDate[0].max)
                    vm.lastRefresh = new Date(vm.chartsData.chartDataDate[0].max);
            }

            /* jshint ignore:end */

            function isMainGroup() {
                return subResearchEntity.id === 1;
            }

        }
    }

)();