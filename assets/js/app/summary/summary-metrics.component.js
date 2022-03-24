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
        '$element',
        'TaskService',
        'groupTypes'
    ];

    function controller(ChartService, ModalService, $timeout, $element, TaskService, groupTypes) {
        const vm = this;

        vm.name = 'summary-metrics';
        vm.shouldBeReloaded = true;

        vm.charts = false;
        vm.showInfo = showInfo;
        vm.hasRefreshDisabled = hasRefreshDisabled;
        vm.recalculate = recalculate;

        vm.recalculating = false;
        const command = `chart:recalculate:${vm.researchEntity.id}`;

        /* jshint ignore:start */
        vm.$onInit = async () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            await checkIsRecalculating();
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

                if (chartsData.chartDataDate && chartsData.chartDataDate[0].max) {
                    vm.lastRefresh = new Date(chartsData.chartDataDate[0].max);
                }
            });
        };

        /* jshint ignore:end */

        function showInfo() {
            ModalService.openWizard(['summary-metrics'], {isClosable: true});
        }

        function hasRefreshDisabled() {
            return vm.researchEntity.getType() === 'group' &&
                [
                    groupTypes.INSTITUTE,
                    groupTypes.CENTER,
                    groupTypes.RESEARCH_DOMAIN
                ].includes(vm.researchEntity.type);
        }

        /* jshint ignore:start */
        async function recalculate() {
            if (vm.recalculating) {
                return;
            }

            vm.recalculating = true;

            try {
                await TaskService.run(`${command}:${vm.researchEntity.id}`);

                const chartsData = await ChartService.getAllChartData(vm.researchEntity);

                if (chartsData.chartDataDate[0].max) {
                    vm.lastRefresh = new Date(chartsData.chartDataDate[0].max);
                }
            } catch (e) {
            }

            vm.recalculating = false;
        }

        async function checkIsRecalculating() {
            vm.recalculating = await TaskService.isRunning(command);
        }

        /* jshint ignore:end */
    }
})();
