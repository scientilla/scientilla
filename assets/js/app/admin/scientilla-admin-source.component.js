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
        'Restangular',
        'SourceService',
        '$scope',
        'Notification',
        'EventsService'
    ];

    function scientillaAdminSource(
        Restangular,
        SourceService,
        $scope,
        Notification,
        EventsService
    ) {
        const vm = this;
        vm.getSources = getSources;
        vm.formatSource = SourceService.formatSource;
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
        vm.isAdding = false;
        vm.isRemoving = false;

        let selectedSourceWithoutMetricsWatcher;

        vm.$onInit = function () {
            selectedSourceWithoutMetricsWatcher = $scope.$watch('vm.selectedSourceWithoutMetrics', getSourceWithMetrics);
        };

        vm.$onDestroy = () => {
            if (_.isFunction(selectedSourceWithoutMetricsWatcher)) {
                selectedSourceWithoutMetricsWatcher();
            }
        };

        /* jshint ignore:start */
        async function getSourceWithMetrics() {
            if (vm.selectedSourceWithoutMetrics) {
                vm.selectedSource = await Restangular.one('sources', vm.selectedSourceWithoutMetrics.id).get({
                    populate: 'metrics'
                });
            }
        }

        async function getSources(searchText) {
            const token = searchText.toLowerCase().split(' | ')[0];
            const qs = {
                where: {
                    title: {
                        contains: token
                    }
                },
                limit: 99999
            };
            return await SourceService.searchAndFilter(qs, token);
        }
        /* jshint ignore:end */

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
            if (!vm.selectedSource || !vm.foundMetrics || !vm.metricsToAdd.length) {
                return;
            }

            vm.isAdding = true;

            const result = await Restangular.one('sources', vm.selectedSource.id)
                .one('metric-sources')
                .customPOST({
                    sourceMetricIds: vm.metricsToAdd.map(m => m.id)
                });

            vm.selectedSource = await Restangular.one('sources', vm.selectedSource.id)
                .get({populate: 'metrics'});

            if (result.length === vm.metricsToAdd.length) {
                Notification.success(`The source ${vm.metricsToAdd.length === 1 ? 'metric is' : ' metrics are'} successfully been added!`);
            } else {
                if (result.length > 0) {
                    Notification.warning(`Only ${result.length} out of ${vm.metricsToAdd.length} source metrics are been added!`);
                } else {
                    Notification.warning('Something went wrong, no source metrics are been added!');
                }
            }

            vm.metricsToAdd = [];
            vm.foundMetrics.forEach(function(metric) {
                metric.selected = false;
            });
            vm.isAdding = false;

            EventsService.publish(EventsService.SOURCE_METRICS_CHANGED, result);
        }

        async function removeMetric() {
            if (!vm.selectedSource || !vm.selectedSource.metrics || !vm.metricsToRemove.length) {
                return;
            }

            vm.isRemoving = true;

            const result = await Restangular.one('sources', vm.selectedSource.id)
                .customDELETE('metric-sources', '', {'content-type': 'application/json'}, {
                    sourceMetricIds: vm.metricsToRemove.map(m => m.id)
                });

            vm.selectedSource = await Restangular.one('sources', vm.selectedSource.id)
                .get({populate: 'metrics'});


            if (result.length === vm.metricsToRemove.length) {
                Notification.success(`The source${vm.metricsToRemove.length === 1 ? 'metric is' : 'metrics are'} successfully been removed!`);
            } else {
                if (result.length > 0) {
                    Notification.warning(`Only ${result.length} out of ${vm.metricsToRemove.length} source metrics are been removed!`);
                } else {
                    Notification.warning('Something went wrong, no source metrics are been removed!');
                }
            }

            vm.metricsToRemove = [];
            vm.isRemoving = false;

            EventsService.publish(EventsService.SOURCE_METRICS_CHANGED, result);
        }
        /* jshint ignore:end */

        vm.isCheckboxDisabled = metric => {
            return vm.selectedSource.metrics.some(m => m.id === metric.id) || vm.isAdding;
        };
    }

})();
