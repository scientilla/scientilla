(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaRangeField', {
            templateUrl: 'partials/scientilla-range-field.html',
            controller: scientillaRangeField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                field: '<',
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

        vm.validate = validate;
        vm.valueChanged = valueChanged;

        let onFieldChangeWatcher;
        let onModelChangeWatcher;

        vm.$onInit = function () {
            onFieldChangeWatcher = $scope.$watch('vm.field', onFieldChange, true);
            onModelChangeWatcher = $scope.$watch('vm.model', onModelChange, true);

            vm.options = {
                floor: vm.field.floor,
                ceil: vm.field.ceil,
                onChange: () => {
                    vm.field.hasChanged = true;
                    vm.model = {min: vm.min, max: vm.max};
                }
            };

            onFieldChange();
        };

        vm.$onDestroy = function () {
            onFieldChangeWatcher();
            onModelChangeWatcher();
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

        function onFieldChange() {
            if (!_.has(vm.field, 'hasChanged') || !vm.field.hasChanged) {
                vm.min = vm.field.floor;
                vm.max = vm.field.ceil;
            }

            if (vm.field.floor === vm.field.ceil) {
                vm.min = vm.max = vm.field.floor;
                vm.options.floor = vm.field.floor - 1;
                vm.options.ceil = vm.field.ceil + 1;
                vm.options.disabled = true;
            } else {
                vm.options.floor = vm.field.floor;
                vm.options.ceil = vm.field.ceil;
                vm.options.disabled = false;
            }

            if (vm.field.values.min < vm.options.floor) {
                vm.min = vm.field.values.min = vm.options.floor;
            }

            if (vm.field.values.max > vm.options.ceil) {
                vm.max = vm.field.values.max = vm.options.ceil;
            }
        }

        function onModelChange() {
            if (_.isNil(vm.model)) {
                vm.min = vm.field.floor;
                vm.max = vm.field.ceil;
                vm.model = {min: vm.min, max: vm.max};
                delete vm.field.hasChanged;
            }
        }
    }

})();