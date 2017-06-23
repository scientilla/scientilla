(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaCheckboxField', {
            templateUrl: 'partials/scientilla-checkbox-field.html',
            controller: scientillaCheckboxField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaCheckboxField.$inject = [];

    function scientillaCheckboxField() {
        const vm = this;

        vm.$onInit = function () {
            vm.cssClass = '';
        };
    }

})();