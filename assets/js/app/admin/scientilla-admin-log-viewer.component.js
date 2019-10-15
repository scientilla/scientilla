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
        '$timeout'
    ];

    function controller(Restangular, $scope, $timeout) {
        const vm = this;

        vm.refreshingTasks = false;

        vm.getTasks = getTasks;

        vm.$onInit = function () {
            getTasks();
        };

        $scope.$watch('vm.task', () => {
            getLogs();
        });

        $scope.$watch('vm.date', () => {
            getLogs();
        });

        $scope.parseDate = (date) => {
            const year = date.substring(0, 4);
            const month = date.substring(4, 6);
            const day = date.substring(6, 8);
            return day + '/' + month + '/' + year;
        };

        $scope.$on('tab-selected', (evt, args) => {
            const name = args.name;
            if (name === 'admin-log-viewer') {
                getLogs();
            }
        });

        /* jshint ignore:start */
        async function getTasks() {
            vm.refreshingTasks = true;
            const res = await Restangular.one('logs', 'tasks').get();

            if (res.type === 'success') {
                vm.tasks = res.tasks;
                vm.task = vm.tasks[0];
                vm.date = vm.task.dates[0];
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
                    angular.element('#log-viewer').scrollTop(99999999);
                }, 0);
            }
        }

        /* jshint ignore:end */
    }

})();