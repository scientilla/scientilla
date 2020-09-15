(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentDetails', {
            templateUrl: 'partials/scientilla-patent-details.html',
            controller: scientillaPatentDetails,
            controllerAs: 'vm',
            bindings: {
                patent: "<"
            }
        });

    scientillaPatentDetails.$inject = [];

    function scientillaPatentDetails() {
        const vm = this;

        vm.collapsed = true;

        vm.$onInit = function () {

        };
    }

})();