(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminSource', {
            templateUrl: 'partials/scientilla-admin-source.html',
            controller: scientillaAdminSource,
            controllerAs: 'vm',
            bindings: {}
        });

    scientillaAdminSource.$inject = [
        'Restangular'
    ];

    function scientillaAdminSource(Restangular) {
        const vm = this;
        vm.getSources = getSources;
        vm.formatSource = formatSource;
        vm.onMetricSearchKey = onMetricSearchKey;
        vm.searchMetrics = searchMetrics;
        vm.selectMetric = selectMetric;
        vm.addMetric = addMetric;
        vm.removeMetric = removeMetric;

        vm.selectedSource = null;
        vm.metrics = [];
        vm.metricsSearch = '';

        vm.metricsToAdd = [];
        vm.metricsToRemove = [];

        vm.$onInit = function () {
        };

        function getSources(searchText) {

            const token = searchText.split(' | ')[0];

            const qs = {
                populate: 'metrics',
                where: {
                    title: {
                        contains: token
                    }
                }
            };
            return Restangular.all('sources').getList(qs);
        }

        function formatSource(source) {
            if (!source) return '';
            return source.title + ' | ' + source.issn + ' | ' + source.eissn + ' | ' + source.scopusId;
        }

        /* jshint ignore:start */
        function onMetricSearchKey(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                searchMetrics();

            }
            else if (event.key === 'Escape') {
                event.preventDefault();
                vm.metricsSearch = '';
                vm.foundMetrics = [];
            }
        }

        async function searchMetrics() {
            if (!vm.metricsSearch)
                return;

            const qs = {
                where: {
                    or: [
                        {sourceTitle: {contains: vm.metricsSearch}},
                        {issn: vm.metricsSearch},
                        {eissn: vm.metricsSearch},
                        {sourceOriginId: vm.metricsSearch}
                    ]
                }
            };
            vm.foundMetrics = await Restangular.all('sourceMetrics').getList(qs);
        }

        /* jshint ignore:end */

        function selectMetric(metric) {
            metric.selected = !metric.selected;

            if (vm.foundMetrics)
                vm.metricsToAdd = vm.foundMetrics.filter(m => m.selected);

            if(vm.selectedSource)
                vm.metricsToRemove = vm.selectedSource.metrics.filter(m => m.selected);
        }

        /* jshint ignore:start */
        async function addMetric() {
            if (!vm.selectedSource || !vm.foundMetrics)
                return;

            if (!vm.metricsToAdd.length)
                return;

            const sourceMetricSources = vm.metricsToAdd.map(m => ({
                sourceMetric: m.id,
                source: vm.selectedSource.id
            }));

            await Restangular.all('sourcemetricsources')
                .post(sourceMetricSources)
                .then(() => {
                    vm.metricsToAdd = [];
                    vm.foundMetrics.forEach(function(metric) {
                        metric.selected = false;
                    });
                });

            vm.selectedSource = await Restangular.one('sources', vm.selectedSource.id)
                .get({populate: 'metrics'});
        }

        async function removeMetric() {
            if (!vm.selectedSource || !vm.selectedSource.metrics)
                return;

            if (!vm.metricsToRemove.length)
                return;

            const criteria = {
                where: {
                    or: vm.metricsToRemove.map(m => ({
                        sourceMetric: m.id,
                        source: vm.selectedSource.id
                    }))
                }
            };

            const sourceMetricSourcesToDelete = await Restangular.all('sourcemetricsources').getList(criteria);

            for (const sms of sourceMetricSourcesToDelete)
                await sms.remove()
                    .then(() => {
                        vm.metricsToRemove = [];
                    });

            vm.selectedSource = await Restangular.one('sources', vm.selectedSource.id)
                .get({populate: 'metrics'});
        }
        /* jshint ignore:end */
    }

})();