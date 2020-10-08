(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryOverview', {
                templateUrl: 'partials/summary-overview.html',
                controller,
                controllerAs: 'vm',
                bindings: {
                    chartsData: '<'
                }
            });

        controller.$inject = [
            'ChartService',
            'ModalService',
            'CustomizeService',
            '$window',
            '$timeout',
            '$scope'
        ];

        function controller(ChartService, ModalService, CustomizeService, $window, $timeout, $scope) {
            const vm = this;
            vm.changeChart = changeChart;
            vm.isChartSelected = isChartSelected;
            vm.showInfo = showInfo;
            vm.getMainChartOptions = getMainChartOptions;

            vm.charts = false;

            let deregister;

            vm.$onInit = () => {
                deregister = $scope.$watch('vm.chartsData', vm.reload);

                CustomizeService.getCustomizations().then(customizations => {
                    let timer = null;

                    vm.customizations = customizations;
                    ChartService.setStyles(vm.customizations);

                    vm.reload(vm.chartsData);

                    if ($window.innerWidth <= 992 && $window.innerWidth > 400) {
                        for (let i = 0; i < vm.charts.length; i++) {
                            vm.charts[i] = getMainChartOptions(vm.charts[i]);
                        }
                    }

                    angular.element($window).bind('resize', function () {
                        $timeout.cancel(timer);
                        timer = $timeout(function () {
                            if ($window.innerWidth <= 992 && $window.innerWidth > 400) {
                                for (let i = 0; i < vm.charts.length; i++) {
                                    vm.charts[i] = getMainChartOptions(vm.charts[i]);
                                }
                            } else {
                                for (let i = 0; i < vm.charts.length; i++) {
                                    vm.charts[i] = getPreviewChartOptions(vm.charts[i]);
                                }
                            }
                        }, 500);
                    });
                });
            };

            vm.$onDestroy = () => {
                deregister();
            };

            vm.reload = () => {
                if (_.isEmpty(vm.chartsData))
                    return;

                $timeout(() => {
                    vm.charts = [];
                    vm.mainChart = undefined;
                    vm.charts.push(ChartService.getDocumentsByYear(vm.chartsData));
                    vm.charts.push(ChartService.getInvitedTalksByYear(vm.chartsData));
                    vm.charts.push(ChartService.getDocumentsByType(vm.chartsData));
                    changeChart(vm.charts[0]);
                });

            };

            function changeChart(chart) {
                vm.mainChart = ChartService.getAsMainChart(chart);
            }

            function isChartSelected(chart) {
                if (!vm.mainChart) return false;
                return chart.title === vm.mainChart.title;
            }

            function showInfo() {
                ModalService.openWizard(['summary-overview'], {isClosable: true});
            }

            function getMainChartOptions(chart) {
                return ChartService.getAsMainChart(chart);
            }

            function getPreviewChartOptions(chart) {
                return ChartService.getAsPreviewChart(chart);
            }
        }
    }

)();