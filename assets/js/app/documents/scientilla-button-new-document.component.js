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
            const subResearchEntity = context.getSubResearchEntity();
            const draft = subResearchEntity.getNewDocument(type);

            ModalService.openScientillaDocumentForm(draft, subResearchEntity);
        }
    }
})();