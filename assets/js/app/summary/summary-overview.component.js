(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryOverview', {
                templateUrl: 'partials/summary-overview.html',
                controller: SummaryOverviewComponent,
                controllerAs: 'vm',
                bindings: {
                    chartsData: '<'
                }
            });

        SummaryOverviewComponent.$inject = [
            'ChartService',
            'ModalService',
            'CustomizeService',
            '$window',
            '$timeout',
            '$element'
        ];

        function SummaryOverviewComponent(ChartService, ModalService, CustomizeService, $window, $timeout, $element) {
            const vm = this;
            vm.changeChart = changeChart;
            vm.isChartSelected = isChartSelected;
            vm.showInfo = showInfo;
            vm.getMainChartOptions = getMainChartOptions;

            vm.name = 'overview';
            vm.shouldBeReloaded = true;
            vm.charts = [];

            vm.$onInit = () => {
                CustomizeService.getCustomizations().then(customizations => {
                    let timer = null;

                    vm.customizations = customizations;
                    ChartService.setStyles(vm.customizations);

                    const registerTab = requireParentMethod($element, 'registerTab');
                    registerTab(vm);
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
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);
            };

            vm.reload = (chartsData = {}) => {
                if (!_.isEmpty(chartsData)) {
                    vm.chartsData = chartsData;
                }

                if (!_.isEmpty(vm.chartsData)) {
                    $timeout(() => {
                        vm.loading = true;
                        vm.charts = [];
                        vm.mainChart = undefined;
                        vm.charts.push(ChartService.getDocumentsByYear(vm.chartsData));
                        vm.charts.push(ChartService.getInvitedTalksByYear(vm.chartsData));
                        vm.charts.push(ChartService.getDocumentsByType(vm.chartsData));
                        changeChart(vm.charts[0]);
                        vm.loading = false;
                    });
                }
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