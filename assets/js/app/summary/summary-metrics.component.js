(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryMetrics', {
            templateUrl: 'partials/summary-metrics.html',
            controller: SummaryMetricsComponent,
            controllerAs: 'vm',
            bindings: {
                chartsData: '<'
            }
        });

    SummaryMetricsComponent.$inject = [
        'ChartService',
        'ModalService',
        '$element',
        '$timeout'
    ];

    function SummaryMetricsComponent(ChartService, ModalService, $element, $timeout) {
        const vm = this;

        vm.name = 'metrics';
        vm.shouldBeReloaded = true;
        vm.charts = {};

        vm.showInfo = showInfo;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.reload = (chartsData = {}) => {
            vm.charts = {};

            if (!_.isEmpty(chartsData)) {
                vm.chartsData = chartsData;
            }

            if (!_.isEmpty(vm.chartsData)) {
                $timeout(() => {
                    vm.charts.documentTotals = ChartService.getDocumentTotals(vm.chartsData);
                    vm.charts.hindexPerYear = ChartService.getHindexPerYear(vm.chartsData);
                    vm.charts.citationsPerDocumentYear = ChartService.getCitationsPerDocumentYear(vm.chartsData);
                    vm.charts.citationsPerYear = ChartService.getCitationsPerYear(vm.chartsData);
                    vm.charts.journalMetricsPerYearLineChart = ChartService.getJournalMetricsPerYearLineChart(
                        vm.chartsData
                    );
                    vm.charts.getJournalMetricsPerYearBarChart = ChartService.getJournalMetricsPerYearBarChart(
                        vm.chartsData
                    );
                    vm.charts.filteredDocumentsByYear = ChartService.getFilteredDocumentsByYear(vm.chartsData);
                    vm.charts.filteredDocumentsSourceTypeByYear = ChartService.getFilteredDocumentsSourceTypeByYear(
                        vm.chartsData
                    );

                    const totalDocuments = ChartService.getTotalFilteredDocuments(vm.chartsData);
                    const totalImpactFactorDocuments = ChartService.getTotalFilteredDocuments(vm.chartsData);
                    const totalImpactFactorDocumentsOnJournals = ChartService.getTotalImpactFactorDocumentsOnJournals(
                        vm.chartsData
                    );
                    const hIndex = ChartService.getHindex(vm.chartsData);
                    const totalCitations = ChartService.getTotalCitations(vm.chartsData);
                    const totalImpactFactor = ChartService.getTotalImpactFactor(vm.chartsData);

                    vm.documentsChartToShow = vm.charts.filteredDocumentsSourceTypeByYear;
                    vm.citationsChartToShow = vm.charts.citationsPerYear;

                    vm.documentsCharts = [
                        {
                            icon: 'fas fa-chart-bar',
                            chartSettings: vm.charts.filteredDocumentsSourceTypeByYear,
                            default: true,
                            title: vm.charts.filteredDocumentsSourceTypeByYear.title
                        },
                        {
                            icon: 'fas fa-university',
                            chartSettings: vm.charts.filteredDocumentsByYear,
                            title: vm.charts.filteredDocumentsSourceTypeByYear.title
                        }
                    ];

                    vm.citationsCharts = [
                        {
                            icon: 'fas fa-quote-right',
                            chartSettings: vm.charts.citationsPerYear,
                            default: true,
                            title: vm.charts.citationsPerYear.title
                        },
                        {
                            icon: 'fas fa-quote-left',
                            chartSettings: vm.charts.citationsPerDocumentYear,
                            title: vm.charts.citationsPerDocumentYear.title
                        }
                    ];

                    vm.metricsCharts = [
                        {
                            icon: 'fas fa-chart-line',
                            chartSettings: vm.charts.journalMetricsPerYearLineChart,
                            id: 'scientilla-chart-journalMetricsPerYear',
                            default: true,
                            title: 'Line chart'
                        },
                        {
                            icon: 'fas fa-chart-bar',
                            chartSettings: vm.charts.getJournalMetricsPerYearBarChart,
                            title: 'Bar chart'
                        }
                    ];

                    vm.indexes = [];
                    vm.indexes.push({
                        label: 'Documents',
                        value: totalDocuments,
                        icons: ['far fa-file-alt icon-documents'],
                        format: 0
                    });
                    vm.indexes.push({
                        label: 'h-index',
                        value: hIndex,
                        icons: ['fas fa-chart-line icon-h-index'],
                        format: 0
                    });
                    vm.indexes.push({
                        label: 'Citations',
                        value: totalCitations,
                        icons: ['fas fa-quote-right icon-citations'],
                        format: 0
                    });
                    vm.indexes.push({
                        label: 'Citations per document',
                        value: (totalCitations / totalDocuments) || 0,
                        icons: ['fas fa-quote-right icon-citations', 'far fa-file-alt icon-citations'],
                        format: 2
                    });
                    vm.indexes.push({
                        label: 'Total IF',
                        value: totalImpactFactor,
                        icons: ['icons-if icon-if'],
                        format: 2
                    });
                    vm.indexes.push({
                        label: 'IF per document',
                        value: (totalImpactFactor / totalImpactFactorDocuments) || 0,
                        icons: ['icons-if icon-if', 'icons-if far fa-file-alt'],
                        format: 2
                    });
                    vm.indexes.push({
                        label: 'IF per document on journals',
                        value: (totalImpactFactor / totalImpactFactorDocumentsOnJournals) || 0,
                        icons: ['icons-if icon-if', 'icons-if far fa-newspaper'],
                        format: 2
                    });
                });
            }
        };

        function showInfo() {
            ModalService.openWizard(['summary-metrics'], {isClosable: true});
        }
    }
})();