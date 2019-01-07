/**
 * Created by Fede on 2/27/2017.
 */

(function () {
    "use strict";
    angular
        .module('documents')
        .component('scientillaButtonNewAccomplishment', {
            templateUrl: 'partials/scientilla-button-new-accomplishment.html',
            controller: scientillaButtonNewAccomplishment,
            controllerAs: 'vm'
        });

    scientillaButtonNewAccomplishment.$inject = [
        'context',
        'ModalService',
        'AccomplishmentTypesService'
    ];

    function scientillaButtonNewAccomplishment(context, ModalService, AccomplishmentTypesService) {
        var vm = this;

        vm.createNewAccomplishment = createNewAccomplishment;
        vm.types = AccomplishmentTypesService.getAccomplishmentTypes();

        function createNewAccomplishment(type) {
            var researchEntity = context.getResearchEntity();
            var draft = researchEntity.getNewDocument(type);

            ModalService
                .openScientillaAccomplishmentForm(draft, researchEntity);
        }
    }
})();