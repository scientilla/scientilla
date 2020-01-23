(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminTools', {
            templateUrl: 'partials/scientilla-admin-tools.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                activeTab: '@?'
            }
        });

    controller.$inject = [
        '$rootScope',
        '$controller',
        '$scope'
    ];

    function controller($rootScope, $controller, $scope) {
        const vm = this;

        angular.extend(vm, $controller('TabsController', {$scope: $scope}));

        vm.$onInit = function () {
            const tabs = [
                {
                    index: 0,
                    slug: 'log-viewer',
                    tabName: 'logViewer'
                }, {
                    index: 1,
                    slug: 'status'
                }, {
                    index: 2,
                    slug: 'backup'
                }, {
                    index: 3,
                    slug: 'institutes',
                }
            ];

            vm.initializeTabs(tabs);
        };
    }

})();