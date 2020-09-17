(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaRangeField', {
            templateUrl: 'partials/scientilla-range-field.html',
            controller: scientillaRangeField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<',
                name: '<',
                errors: '<',
                onValidate: '&',
                onChange: '&'
            }
        });

    scientillaRangeField.$inject = [
        '$scope'
    ];

    function scientillaRangeField($scope) {
        const vm = this;
        vm.cssClass = 'form-control';

        vm.$onInit = function () {};

        vm.validate = validate;
        vm.valueChanged = valueChanged;

        vm.options = {
            floor: vm.structure.values.min,
            ceil: vm.structure.values.max,
            onChange: () => {
                vm.model = {min: vm.min, max: vm.max};
            }
        };

        vm.min = vm.structure.values.min;
        vm.max = vm.structure.values.max;

        let onValueChangeDeregisterer;

        vm.$onInit = function () {
            onValueChangeDeregisterer = $scope.$watch('vm.structure.values', onModelChange);
        };

        vm.$onDestroy = function () {
            onValueChangeDeregisterer();
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

        function onModelChange() {
            vm.min = vm.structure.values.min;
            vm.max = vm.structure.values.max;

            vm.options.floor = vm.min;
            vm.options.ceil = vm.max;
        }
    }

})();