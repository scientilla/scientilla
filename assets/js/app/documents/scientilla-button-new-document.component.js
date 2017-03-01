/**
 * Created by Fede on 2/27/2017.
 */

(function () {
    angular
        .module('documents')
        .component('scientillaButtonNewDocument', {
            templateUrl: 'partials/scientilla-button-new-document.html',
            controller: ScientillaButtonNewDocument,
            controllerAs: 'vm'
        });

    ScientillaButtonNewDocument.$inject = [
        'context',
        'ModalService',
        'DocumentTypesService'
    ];

    function ScientillaButtonNewDocument(context, ModalService, DocumentTypesService) {
        var vm = this;

        vm.researchEntity = context.getResearchEntity();
        vm.createNewDocument = createNewDocument;
        vm.types = DocumentTypesService.getDocumentTypes();


        function openMenu($mdOpenMenu, ev) {
            $mdOpenMenu(ev);
        }

        function createNewDocument(type) {
            var draft = vm.researchEntity.getNewDocument(type);

            ModalService
                .openScientillaDocumentForm(draft, vm.researchEntity);
        }
    }
})();