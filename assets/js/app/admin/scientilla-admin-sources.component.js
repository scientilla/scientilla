(function () {
    'use strict';

    angular.module('admin')
        .component('scientillaAdminSources', {
            templateUrl: 'partials/scientilla-admin-sources.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        '$rootScope'
    ];

    function controller($rootScope) {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.selectTab = tab => {
            $rootScope.$broadcast('tab-selected', {name: tab});
        };
    }

})();