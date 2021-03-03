/* global Scientilla */

(function () {
    angular
        .module('documents')
        .component('scientillaSuggestedDocuments', {
            templateUrl: 'partials/scientilla-suggested-documents.html',
            controller: scientillaSuggestedDocumentsController,
            controllerAs: 'vm',
            bindings: {
            }
        });

    scientillaSuggestedDocumentsController.$inject = [
        'context',
        'researchEntityService',
        'EventsService',
        'ModalService',
        'documentListSections',
        'documentCategories'
    ];

    function scientillaSuggestedDocumentsController(context,
                                                    researchEntityService,
                                                    EventsService,
                                                    ModalService,
                                                    documentListSections,
                                                    documentCategories) {
        const vm = this;

        const DocumentsService = context.getDocumentService();
        const subResearchEntity = context.getSubResearchEntity();

        vm.copyDocument = DocumentsService.copyDocument;
        vm.verifyDocument = DocumentsService.verifyDocument;
        vm.verifyDocuments = DocumentsService.verifyDocuments;
        vm.discardDocument = DocumentsService.discardDocument;
        vm.copyDocuments = DocumentsService.copyDocuments;
        vm.discardDocuments = DocumentsService.discardDocuments;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.documentCategories = documentCategories;
        vm.documents = [];
        let query = {};

        vm.onFilter = onFilter;

        vm.documentListSections = documentListSections;

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.NOTIFICATION_ACCEPTED,
                EventsService.NOTIFICATION_DISCARDED,
                EventsService.DOCUMENT_UNVERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED,
                EventsService.DOCUMENT_DISCARDED,
                EventsService.DOCUMENT_COMPARE
            ], updateList);

            if (subResearchEntity.getType() === 'user' && !subResearchEntity.alreadyOpenedSuggested) {
                addAliasModal();
                subResearchEntity.alreadyOpenedSuggested = true;
                subResearchEntity.save();
            }
        };


        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            return getData(q)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }

        //private
        function getData(q) {
            var discarded = q.where.discarded;
            delete q.where.discarded;
            query = q;

            if (!discarded)
                return researchEntityService.getSuggestedDocuments(subResearchEntity, query);
            else
                return researchEntityService.getDiscardedDocuments(subResearchEntity, query);
        }

        function addAliasModal() {
            ModalService.openWizard(['alias-edit'], {
                isClosable: true,
                size: 'lg'
            });
        }
    }
})();
