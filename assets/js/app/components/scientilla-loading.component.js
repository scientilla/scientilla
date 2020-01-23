(function () {
    'use strict';

    angular.module('components')
        .component('scientillaLoading', {
            templateUrl: 'partials/scientilla-loading.html',
            controller: scientillaLoading,
            controllerAs: 'vm',
            transclude: true,
            bindings: {
                isLoading: '<',
                text: '@?'
            }
        });


    scientillaLoading.$inject = [];

    function scientillaLoading() {
        const vm = this;

        vm.$onInit = function () {
            if (_.isNil(vm.text)) {
                vm.text = 'Loading ...';
            }
        };

        vm.$onDestroy = function () {
        };
    }
})();