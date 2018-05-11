/**
 * Created by Fede on 2/27/2017.
 */

(function () {
    "use strict";
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

        vm.createNewDocument = createNewDocument;
        vm.openScientillaDocumentSearch = ModalService.openScientillaDocumentSearch;
        vm.types = DocumentTypesService.getDocumentTypes();

        function createNewDocument(type) {
            var researchEntity = context.getResearchEntity();
            var draft = researchEntity.getNewDocument(type);

            ModalService
                .openScientillaDocumentForm(draft, researchEntity);
        }
    }
})();