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
                id: '<'
            }
        });

    scientillaTextField.$inject = [];

    function scientillaTextField() {
        const vm = this;
        vm.cssClass = 'form-control';
    }

})();