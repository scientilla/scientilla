(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaExternalDocuments', {
            templateUrl: 'partials/scientilla-external-documents.html',
            controller: scientillaExternalDocuments,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaExternalDocuments.$inject = [
        'context',
        'documentListSections',
        'EventsService'
    ];

    function scientillaExternalDocuments(context, documentListSections, EventsService) {
        const vm = this;

        const DocumentService = context.getDocumentService();

        vm.copyDocument = DocumentService.copyDocument;
        vm.copyDocuments = DocumentService.copyDocuments;
        vm.verifyDocument = DocumentService.verifyDocument;
        vm.verifyDocuments = DocumentService.verifyDocuments;
        vm.copyUncopiedDocuments = DocumentService.copyUncopiedDocuments;
        vm.onFilter = onFilter;

        vm.documentListSections = documentListSections;
        vm.documents = [];
        let query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.NOTIFICATION_ACCEPTED,
                EventsService.NOTIFICATION_DISCARDED,
                EventsService.DRAFT_UNVERIFIED,
                EventsService.DOCUMENT_VERIFIED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            query = q;

            return DocumentService.getExternalDocuments(query)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }
    }
})();
