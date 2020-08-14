(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaRadioField', {
            templateUrl: 'partials/scientilla-radio-field.html',
            controller: scientillaRadioField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaRadioField.$inject = [];

    function scientillaRadioField() {
        const vm = this;

        vm.$onInit = function () {
            vm.cssClass = '';
        };
    }

})();