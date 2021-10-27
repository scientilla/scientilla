(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminLogViewer', {
            templateUrl: 'partials/scientilla-admin-log-viewer.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'Restangular',
        '$scope',
        '$timeout',
        '$element'
    ];

    function controller(Restangular, $scope, $timeout, $element) {
        const vm = this;

        vm.name = 'logViewer';
        vm.shouldBeReloaded = true;

        vm.refreshingTasks = false;
        vm.refreshingLogs = false;
        let deregisterers = [];

        vm.getTasks = getTasks;
        vm.refreshLogs = refreshLogs;

        vm.$onInit = function () {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            deregisterers.push($scope.$watch('vm.task', taskHasChanged));
            deregisterers.push($scope.$watch('vm.date', getLogs));
        };

        vm.$onDestroy = function () {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            deregisterers.forEach(d => d());
        };

        $scope.parseDate = (date) => {
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);
            return day + '/' + month + '/' + year;
        };

        function taskHasChanged() {
            if (!vm.task) {
                return;
            }
            const dateOfFirstTask = !_.isEmpty(vm.task) ? vm.task.dates[0] : '';

            if (dateOfFirstTask === vm.date) {
                getLogs();
            } else {
                vm.date = dateOfFirstTask;
            }
        }

        /* jshint ignore:start */
        async function getTasks() {
            vm.refreshingTasks = true;
            const res = await Restangular.one('logs', 'tasks').get();

            if (res.type === 'success') {
                vm.tasks = res.tasks;
                vm.task = Array.isArray(vm.tasks) ? vm.tasks[0] : {};
                vm.date = !_.isEmpty(vm.task) ? vm.task.dates[0] : '';
            }

            $timeout(() => {
                vm.refreshingTasks = false;
            }, 500);
        }

        async function getLogs() {

            if (vm.task && vm.task.taskName && vm.date) {
                const res = await Restangular.one('logs/' + vm.task.taskName + '/' + vm.date).get();

                if (res.type === 'success') {
                    vm.logs = res.logs;
                }

                $timeout(() => {
                    vm.refreshingLogs = false;
                    angular.element('#log-viewer').scrollTop(99999999);
                }, 0);
            }
        }

        async function refreshLogs() {
            vm.refreshingLogs = true;
            getLogs();
        }

        vm.reload = async () => {
            await getTasks();
        };

        /* jshint ignore:end */
    }
})();
