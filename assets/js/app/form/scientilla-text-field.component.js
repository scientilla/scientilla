(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaTextField', {
            templateUrl: 'partials/scientilla-text-field.html',
            controller: scientillaTextField,
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

    scientillaTextField.$inject = [];

    function scientillaTextField() {
        const vm = this;
        vm.cssClass = 'form-control';

        vm.$onInit = function () {};

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
    }

})();