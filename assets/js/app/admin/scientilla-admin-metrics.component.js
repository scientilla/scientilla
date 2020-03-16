(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminMetrics', {
            templateUrl: 'partials/scientilla-admin-metrics.html',
            controller: scientillaAdminMetrics,
            controllerAs: 'vm',
            bindings: {}
        });

    scientillaAdminMetrics.$inject = [
        'Restangular',
        'Notification',
        '$timeout',
        '$element'
    ];

    function scientillaAdminMetrics(Restangular, Notification, $timeout, $element) {
        const vm = this;

        vm.name = 'metricsImport';
        vm.shouldBeReloaded = true;

        vm.importMetrics = importMetrics;
        vm.assignMetrics = assignMetrics;
        vm.getLogs = getLogs;
        vm.getMetrics = getMetrics;

        vm.types = {
            'import': {
                taskName: 'import:sourcesMetrics',
                element: '#log-viewer-import',
                refreshingLogs: false,
                logs: [],
                refreshingMetrics: false,
                metrics: []
            },
            'assign': {
                taskName: 'documents:assignMetrics',
                element: '#log-viewer-assign',
                refreshingLogs: false,
                logs: [],
                refreshingMetrics: false,
                metrics: []
            }
        };

        vm.$onInit = function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.reload = () => {
            vm.years = getYears();
            vm.years.unshift('All');
            vm.year = vm.years[0];

            for (const type in vm.types) {
                getLogs(type);
                getMetrics(type);
            }
        };

        function getYears() {
            const years = [];
            const today = new Date();
            let year = today.getFullYear();

            while(year >= 2016) {
                years.push(year);
                year--;
            }

            return years;
        }

        /* jshint ignore:start */
        async function importMetrics() {
            const formData = new FormData();
            if (vm.sourceMetricsFile) {
                formData.append('file', vm.sourceMetricsFile);
            }

            await Restangular.one('source-metrics/import').customPOST(formData, '', undefined, {'Content-Type': undefined});

            vm.sourceMetricsFile = null;
            document.getElementById('sourceMetricsFile').value = null;

            Notification.success('Import source metrics is been started!');
        }

        async function assignMetrics() {
            await Restangular.one('source-metrics/assign').customPOST({year: vm.year});

            vm.sourceMetricsFile = null;
            document.getElementById('year').selectedIndex = 0;
            vm.year = vm.years[0];

            Notification.success('Assignment source metrics is been started!');
        }

        async function getMetrics(type) {
            vm.types[type].refreshingMetrics = true;
            vm.types[type].metrics = await Restangular.one('source-metrics/' + type).get();
            $timeout(() => {
                vm.types[type].refreshingMetrics = false;
            }, 500);
        }

        async function getLogs(type) {
            vm.types[type].refreshingLogs = true;

            const res = await Restangular.one('logs/' + vm.types[type].taskName).get();

            if (res.type === 'success') {
                vm.types[type].logs = res.logs;
            }

            $timeout(() => {
                vm.types[type].refreshingLogs = false;
                angular.element(vm.types[type].element).scrollTop(99999999);
            }, 500);
        }
        /* jshint ignore:end */
    }

})();