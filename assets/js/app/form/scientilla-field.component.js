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
                name: '<',
                reset: '&'
            }
        });

    scientillaField.$inject = [];

    function scientillaField() {
        const vm = this;

        vm.isButton = isButton;

        vm.fieldStructure = {};
        vm.fieldStructure.disabled = false;

        vm.$onInit = function () {
            vm.id = new Date().getUTCMilliseconds();

            if (vm.structure.cssClass)
                vm.fieldStructure.cssClass = vm.structure.cssClass;

            if (vm.structure.disabled)
                vm.fieldStructure.disabled = vm.structure.disabled;

            if (vm.structure.labelPosition)
                vm.fieldStructure.labelPosition = vm.structure.labelPosition;

            vm.fieldStructure.placeholder = vm.structure.placeholder;
            vm.fieldStructure.label = vm.structure.label;

            vm.fieldStructure.values = vm.structure.values;

            if (isButton()) {
                if (_.isFunction(vm.structure.onClick))
                    vm.onClick = vm.structure.onClick;
                else if(vm.structure.onClick === 'reset')
                    vm.onClick = vm.reset();
                else if(vm.structure.onClick === 'submit')
                    vm.onClick = null;
            }

            // TODO move all events handlers inside this component


        };

        function isButton() {
            return vm.structure.inputType === 'button' || vm.structure.inputType === 'submit';
        }
    }

})();