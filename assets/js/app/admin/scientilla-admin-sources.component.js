(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminSources', {
            templateUrl: 'partials/scientilla-admin-sources.html',
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
                    slug: 'source',
                }, {
                    index: 1,
                    slug: 'metrics-import',
                    tabName: 'metricsImport'
                }
            ];

            vm.initializeTabs(tabs);
        };
    }
})();