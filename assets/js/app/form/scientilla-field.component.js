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
                reset: '&',
                errors: '<',
                onValidate: '&',
                onChange: '&'
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

            vm.fieldStructure = vm.structure;

            if (isButton()) {
                if (_.isFunction(vm.structure.onClick))
                    vm.onClick = vm.structure.onClick;
                else if (vm.structure.onClick === 'reset')
                    vm.onClick = vm.reset();
                else if (vm.structure.onClick === 'submit')
                    vm.onClick = null;
            }

            if (_.isFunction(vm.structure.ngIf))
                vm.ngIf = vm.structure.ngIf;
            else
                vm.ngIf = () => true;

            // TODO move all events handlers inside this component
        };

        function isButton() {
            return vm.structure.inputType === 'button' || vm.structure.inputType === 'submit';
        }
    }

})();