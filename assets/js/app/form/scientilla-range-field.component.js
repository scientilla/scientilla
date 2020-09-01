(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaRangeField', {
            templateUrl: 'partials/scientilla-range-field.html',
            controller: scientillaRangeField,
            controllerAs: 'vm',
            bindings: {
                min: '=',
                max: '=',
                model: '=',
                structure: '<',
                id: '<',
                name: '<',
                errors: '<',
                onValidate: '&',
                onChange: '&'
            }
        });

    scientillaRangeField.$inject = [];

    function scientillaRangeField() {
        const vm = this;
        vm.cssClass = 'form-control';

        vm.$onInit = function () {};

        vm.validate = validate;
        vm.valueChanged = valueChanged;

        vm.options = {
            floor: vm.min,
            ceil: vm.max,
            onChange: () => {
                vm.model = {min: vm.min, max: vm.max};
            }
        };

        vm.$onInit = function () {
            if(!_.isNil(vm.model)) {
                /*vm.options.floor = vm.model.min;
                vm.options.ceil = vm.model.max;

                vm.min = vm.model.min;
                vm.max = vm.model.max;*/
            }
        };

        function validate(name = false) {
            if (_.isFunction(vm.onValidate)) {
                vm.onValidate({name});
            }
        }

        function valueChanged(name = false) {
            if (_.isFunction(vm.onChange)) {
                vm.onChange({name});
            }
        }
    }

})();