(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaSelectField', {
            templateUrl: 'partials/scientilla-select-field.html',
            controller: scientillaSelectField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaSelectField.$inject = [];

    function scientillaSelectField() {
        const vm = this;
        vm.cssClass = 'form-control';
        vm.values = [{value: '?', label: 'Select'}];

        vm.$onInit = function () {
            if (vm.structure.values)
                vm.values = vm.structure.values;

            if (!vm.model) vm.model = '?';
        };


    }

})();