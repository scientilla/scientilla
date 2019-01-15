(function () {
    "use strict";
    angular
        .module('accomplishments')
        .component('scientillaButtonNewAccomplishment', {
            templateUrl: 'partials/scientilla-button-new-accomplishment.html',
            controller: ScientillaButtonNewAccomplishment,
            controllerAs: 'vm'
        });

    ScientillaButtonNewAccomplishment.$inject = [
        'context',
        'ModalService',
        'AccomplishmentTypesService'
    ];

    function ScientillaButtonNewAccomplishment(context, ModalService, AccomplishmentTypesService) {
        var vm = this;

        vm.openAccomplishmentForm = openAccomplishmentForm;

        // Store all the different accomplishment types
        vm.types = AccomplishmentTypesService.getTypes();

        // Function to open the modal with a form to create a new accomplishment
        function openAccomplishmentForm(type) {
            var researchEntity = context.getResearchEntity(),
                draft          = researchEntity.getNewAccomplishment(type);

            // Open the accomplishment form and pass an empty accomplishment and the current research entity
            ModalService
                .openScientillaAccomplishmentForm(draft, researchEntity);
        }
    }
})();