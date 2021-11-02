(function () {
        "use strict";

        angular
            .module('summary')
            .component('summaryOverview', {
                templateUrl: 'partials/summary-overview.html',
                controller,
                controllerAs: 'vm',
                bindings: {
                    researchEntity: '<'
                }
            });

        controller.$inject = [
            'ChartService',
            'ModalService',
            '$window',
            '$timeout',
            '$element'
        ];

        function controller(ChartService, ModalService, $window, $timeout, $element) {
            const vm = this;

            vm.name = 'overview';
            vm.shouldBeReloaded = true;

            vm.changeChart = changeChart;
            vm.isChartSelected = isChartSelected;
            vm.showInfo = showInfo;
            vm.getMainChartOptions = getMainChartOptions;

            vm.charts = [];

            vm.$onInit = () => {
                const registerTab = requireParentMethod($element, 'registerTab');
                registerTab(vm);
            };

            vm.$onDestroy = function () {
                const unregisterTab = requireParentMethod($element, 'unregisterTab');
                unregisterTab(vm);
            };

            /* jshint ignore:start */
            vm.getData = async () => {
                return await ChartService.getDocumentsOverviewChartData(vm.researchEntity);
            };
            /* jshint ignore:end */

            vm.reload = chartsData => {
                $timeout(() => {
                    vm.charts = [];
                    vm.mainChart = undefined;
                    vm.charts.push(ChartService.getDocumentsByYear(chartsData));
                    vm.charts.push(ChartService.getInvitedTalksByYear(chartsData));
                    vm.charts.push(ChartService.getDocumentsByType(chartsData));
                    changeChart(vm.charts[0]);

                    let timer = null;

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
