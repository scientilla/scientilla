(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaMultipleCheckboxField', {
            templateUrl: 'partials/scientilla-multiple-checkbox-field.html',
            controller: field,
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

    field.$inject = ['$scope', '$element'];

    function field($scope, $element) {
        const vm = this;
        vm.cssClass = 'form-control';
        vm.checkboxModel = {};
        vm.dropdownIsOpen = false;

        vm.$onInit = function () {
            if (vm.model) {
                const keys = vm.model.split(',');
                for (const key of keys) {
                    vm.checkboxModel[key] = true;
                }
            }

            $scope.$watch('vm.checkboxModel', () => {
                const tmpCheckboxModel = vm.getSelectedOptions();
                vm.model = Object.keys(tmpCheckboxModel).join(',');

                const container = $element[0].getElementsByClassName('dropdown-scroll-container');
                if (container && container[0]) {
                    container[0].scrollTop = 0;
                }
            }, true);
        };

        vm.$onDestroy = function () {
        };

        vm.validate = validate;
        vm.valueChanged = valueChanged;

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

        vm.getSelectedOptions = () => {
            const tmpModel = _.cloneDeep(vm.checkboxModel);

            if (_.isUndefined(tmpModel)) {
                return false;
            }

            Object.keys(tmpModel).forEach(key => {
                if (!tmpModel[key]) {
                    delete tmpModel[key];
                }
            });

            return tmpModel;
        };

        vm.getNumberOfSelectedOptions = () => {
            return Object.keys(vm.getSelectedOptions()).length;
        };

        vm.isChecked = option => {
            return _.has(vm.checkboxModel, option) && vm.checkboxModel[option];
        };

        vm.isNotChecked = option => {
            return !_.has(vm.checkboxModel, option) || _.has(vm.checkboxModel, option) && !vm.checkboxModel[option];
        };

        vm.selectAll = $event => {
            for (const option of vm.structure.values) {
                vm.checkboxModel[option] = true;
            }
            $event.stopPropagation();
            $event.preventDefault();
        };

        vm.deselectAll = $event => {
            vm.checkboxModel = {};
            $event.stopPropagation();
            $event.preventDefault();
        };

        vm.close = $event => {
            vm.dropdownIsOpen = false;
            $event.preventDefault();
            $event.stopPropagation();
        };

        vm.getDropdownLabel = () => {
            const numberOfSelectedOptions = vm.getNumberOfSelectedOptions();

            if (numberOfSelectedOptions === 0) {
                return 'Select';
            } else {
                return `${numberOfSelectedOptions} selected ${vm.structure.label.toLowerCase()}s`;
            }
        };
    }
})();
