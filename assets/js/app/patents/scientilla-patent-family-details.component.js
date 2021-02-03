(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentFamilyDetails', {
            templateUrl: 'partials/scientilla-patent-family-details.html',
            controller: scientillaPatentFamilyDetails,
            controllerAs: 'vm',
            bindings: {
                patentFamily: "<"
            }
        });

    scientillaPatentFamilyDetails.$inject = [];

    function scientillaPatentFamilyDetails() {
        const vm = this;

        vm.$onInit = function () {
            //console.log(vm.patentFamily);
        };
    }

})();