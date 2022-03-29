/* global angular */

(function () {
    "use strict";

    angular
        .module('summary')
        .component('summaryMetrics', {
            templateUrl: 'partials/summary-metrics.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = [
        'ChartService',
        'ModalService',
        '$timeout',
        '$element'
    ];

    function controller(ChartService, ModalService, $timeout, $element) {
        const vm = this;

        vm.name = 'summary-metrics';
        vm.shouldBeReloaded = true;

        vm.charts = false;
        vm.showInfo = showInfo;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        vm.getData = async () => {
            return await ChartService.getBibliometricChartData(vm.researchEntity);
        }
        /* jshint ignore:end */

        vm.reload = chartsData => {
            $timeout(() => {
                vm.charts = {};
                vm.charts.documentTotals = ChartService.getDocumentTotals(chartsData);
                vm.charts.hindexPerYear = ChartService.getHindexPerYear(chartsData);
                vm.charts.citationsPerDocumentYear = ChartService.getCitationsPerDocumentYear(chartsData);
                vm.charts.citationsPerYear = ChartService.getCitationsPerYear(chartsData);
                vm.charts.journalMetricsPerYearLineChart = ChartService.getJournalMetricsPerYearLineChart(
                    chartsData
                );
                vm.charts.getJournalMetricsPerYearBarChart = ChartService.getJournalMetricsPerYearBarChart(
                    chartsData
                );
                vm.charts.filteredDocumentsByYear = ChartService.getFilteredDocumentsByYear(chartsData);
                vm.charts.filteredDocumentsSourceTypeByYear = ChartService.getFilteredDocumentsSourceTypeByYear(
                    chartsData
                );

                const totalDocuments = ChartService.getTotalFilteredDocuments(chartsData);
                const totalImpactFactorDocuments = ChartService.getTotalFilteredDocuments(chartsData);
                const totalImpactFactorDocumentsOnJournals = ChartService.getTotalImpactFactorDocumentsOnJournals(
                    chartsData
                );
                const hIndex = ChartService.getHindex(chartsData);
                const totalCitations = ChartService.getTotalCitations(chartsData);
                const totalImpactFactor = ChartService.getTotalImpactFactor(chartsData);

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

                vm.charts.patentsByYear = ChartService.getPatentsByYear(chartsData);
                vm.charts.projectsByYear = ChartService.getProjectAnnualContributionsByYear(chartsData);

            });
        };

        /* jshint ignore:end */

        function showInfo() {
            ModalService.openWizard(['summary-metrics'], {isClosable: true});
        }

        /* jshint ignore:end */
    }
})();
