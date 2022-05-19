(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminAccessLogViewer', {
            templateUrl: 'partials/scientilla-admin-access-log-viewer.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        '$timeout',
        '$element',
        'ModalService',
        '$http'
    ];

    function controller(Restangular, $timeout, $element, ModalService, $http) {
        const vm = this;

        vm.name = 'accessLogViewer';
        vm.shouldBeReloaded = true;

        vm.refreshingDates = false;
        vm.refreshingLogs = false;

        vm.getAccessLogs = getAccessLogs;
        vm.getAccessLog = getAccessLog;

        vm.files = [];
        vm.dates = [];
        vm.date = false;

        vm.$onInit = function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        /* jshint ignore:start */
        async function getAccessLogs() {
            vm.refreshingDates = true;
            vm.files = [];
            const res = await Restangular.one('access-logs', 'get').get();

            if (res.type === 'success') {
                for (const file of res.files) {
                    const date = file.replace('access_logs_', '').replace('.log', '');
                    vm.files.push({
                        file: file.replace('.log', ''),
                        date: moment(date, 'DDMMYYYY').format('DD/MM/YYYY')
                    });
                }

                vm.dates = _.orderBy(vm.files, 'date', 'desc').map(f => f.date);
                vm.date = _.head(vm.dates);
            }

            $timeout(() => {
                vm.refreshingDates = false;
            }, 500);
        }

        async function getAccessLog() {
            const buttonKey = await ModalService.multipleChoiceConfirm('Load access log',
                `Due to the high number of lines in the file this can take a while. The average loading time is 45s.`,
                {'proceed': 'Proceed'});

            if (buttonKey !== 'proceed') {
                return;
            }

            vm.refreshingLogs = true;
            if (vm.files.length < 1 || !vm.date) {
                return;
            }
            const file = vm.files.find(f => f.date === vm.date);
            const res = await Restangular.one('access-logs/get/' + file.file).get();
            vm.file = [];
            for (const line of res.file) {
                const content = line.substring(1).slice(0, -1).split('", "');
                vm.file.unshift({
                    timestamp: content[0],
                    path: content[1],
                    method: content[2],
                    ip: content[3]
                });
            }

            $timeout(() => {
                vm.refreshingLogs = false;
            }, 500);
        }

        vm.reload = async () => {
            await getAccessLogs();
        };

        vm.refreshLogs = async () => {
            await getAccessLog();
        };

        vm.download = async () => {
            const file = vm.files.find(f => f.date === vm.date);

            function createObjectURL(file) {
                if (window.webkitURL) {
                    return window.webkitURL.createObjectURL(file);
                } else if (window.URL && window.URL.createObjectURL) {
                    return window.URL.createObjectURL(file);
                } else {
                    return null;
                }
            }

            $http.post('/api/v1/access-logs/download', {
                name: file.file,
            }, {responseType: 'blob'}).then(res => {
                const element = document.createElement('a');
                element.setAttribute('href', createObjectURL(res.data));
                element.setAttribute('download', file.file + '.csv');

                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
            }).catch(err => {
                const reader = new FileReader();
                reader.addEventListener('loadend', (e) => {
                    Notification.warning(JSON.parse(e.srcElement['result']));
                });
                reader.readAsText(err.data);
            })
        };
        /* jshint ignore:end */
    }
})();
