(function () {
    'use strict';

    angular.module('scientilla-form')
        .component('scientillaAttributeField', {
            templateUrl: 'partials/scientilla-attribute-field.html',
            controller: scientillaAttributeField,
            controllerAs: 'vm',
            bindings: {
                model: '=',
                structure: '<',
                id: '<'
            }
        });

    scientillaAttributeField.$inject = [];

    function scientillaAttributeField() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();