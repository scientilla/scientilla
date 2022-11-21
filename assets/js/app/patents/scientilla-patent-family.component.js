/* global angular */
(function () {
    'use strict';

    angular.module('patents')
        .component('scientillaPatentFamily', {
            templateUrl: 'partials/scientilla-patent-family.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                patentFamily: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'ModalService'
    ];

    function controller(
        ModalService
    ) {

        const vm = this;

        vm.patentFamily = {
            dock: 'PT130155',
            patents: [{}, {}, {}],
            verified: [{}, {}, {}]
        };

        vm.openDetails = openDetails;

        function openDetails() {
            ModalService
                .openPatentFamilyDetails(vm.patentFamily);
        }
    }
})();
