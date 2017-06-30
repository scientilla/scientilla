(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaField', {
            templateUrl: 'partials/scientilla-field.html',
            controller: scientillaField,
            controllerAs: 'vm',
            bindings: {
                structure: '<',
                values: '=',
                name: '<'
            }
        });

    scientillaField.$inject = [];

    function scientillaField() {
        const vm = this;

        vm.fieldStructure = {};
        vm.fieldStructure.disabled = false;

        vm.$onInit = function () {
            vm.id = new Date().getUTCMilliseconds();

            if (vm.structure.cssClass)
                vm.fieldStructure.cssClass = vm.structure.cssClass;

            if (vm.structure.disabled)
                vm.fieldStructure.disabled = vm.structure.disabled;

            vm.fieldStructure.placeholder = vm.structure.placeholder;
            vm.fieldStructure.label = vm.structure.label;

            vm.fieldStructure.values = vm.structure.values;
        };
    }

})();