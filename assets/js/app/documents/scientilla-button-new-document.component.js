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
        'DocumentTypesService',
        'FormService',
        'EventsService'
    ];

    function ScientillaButtonNewDocument(context, ModalService, DocumentTypesService, FormService, EventsService) {
        var vm = this;

        const documentService = context.getDocumentService();

        vm.createNewDocument = createNewDocument;
        vm.openScientillaDocumentSearch = ModalService.openScientillaDocumentSearch;
        vm.types = DocumentTypesService.getDocumentTypes();

        function createNewDocument(type) {

            let researchEntity = context.getResearchEntity();
            let document = researchEntity.getNewDocument(type);
            let originalDocument = angular.copy(document);
            let modal = {};

            let closing = function(event = false, reason = false, data = {}) {

                let formHasUnsavedData = false;

                if (!modal.forceClose) {

                    document = angular.copy(data.document);
                    originalDocument = angular.copy(data.documentBackup);

                    if (document.id) {
                        formHasUnsavedData = FormService.getUnsavedData('edit-document');
                    } else {
                        formHasUnsavedData = FormService.getUnsavedData('new-document');
                    }

                    if (formHasUnsavedData) {
                        if (event) {
                            event.preventDefault();
                        }

                        ModalService
                            .multipleChoiceConfirm('Unsaved data',
                                `Do you want to save this data?`,
                                ['Yes', 'No'],
                                false)
                            .then(function (buttonIndex) {
                                switch (buttonIndex) {
                                    case 0:
                                        if (document.id) {
                                            document.save().then(() => {
                                                EventsService.publish(EventsService.DRAFT_UPDATED, document);
                                                FormService.setUnsavedData('edit-document', false);
                                            });
                                        } else {
                                            documentService.createDraft(document)
                                                .then(draft => {
                                                    document = draft;
                                                    EventsService.publish(EventsService.DRAFT_UPDATED, document);
                                                    FormService.setUnsavedData('new-document', false);
                                                });
                                        }

                                        modal.forceClose = true;
                                        modal.close();
                                        break;
                                    case 1:
                                        document = angular.copy(originalDocument);

                                        if (document.id) {
                                            FormService.setUnsavedData('edit-document', false);
                                        } else {
                                            FormService.getUnsavedData('new-document', false);
                                        }

                                        modal.forceClose = true;
                                        modal.close();
                                        break;
                                    default:
                                        break;
                                }
                            });
                    } else {
                        modal.forceClose = true;
                        modal.close();
                    }
                }
            };

            modal = ModalService
                .openScientillaDocumentForm(document, researchEntity, closing);
        }
    }
})();