(function () {
    "use strict";
    angular.module('app')
        .component('scientillaButtonNewResearchItem', {
            templateUrl: 'partials/scientilla-button-new-research-item.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                category: '@'
            }
        });

    controller.$inject = [
        'context',
        'ModalService',
        'ResearchItemTypesService',
        'ResearchEntitiesService'
    ];

    function controller(context, ModalService, ResearchItemTypesService, ResearchEntitiesService) {
        const vm = this;

        vm.openResearchItemForm = openResearchItemForm;

        let researchEntity;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.types = await ResearchItemTypesService.getTypes(vm.category);

            if (_.isEmpty(vm.types)) {
                vm.types.push(vm.category);
            }

            researchEntity = await context.getResearchEntity();
        };

        // Function to open the modal with a form to create a new research item
        async function openResearchItemForm(type) {
            const researchEntity = await context.getResearchEntity(),
                draft = ResearchEntitiesService.getNewItemDraft(researchEntity, type);

            if (vm.category === 'agreement') {
                ModalService.openAgreementForm(researchEntity, draft);
            } else {
                // Open the form and pass an empty research item and the current research entity
                ModalService.openScientillaResearchItemForm(researchEntity, draft, vm.category);
            }
        }

        /* jshint ignore:end */
    }
})();
