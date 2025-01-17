(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaVerifiedList', {
            templateUrl: 'partials/scientilla-verified-list.html',
            controller: scientillaVerifiedList,
            controllerAs: 'vm',
            bindings: {
            }
        });

    scientillaVerifiedList.$inject = [
        'documentListSections',
        'documentCategories',
        'context',
        'researchEntityService',
        'EventsService',
        'AuthService'
    ];

    function scientillaVerifiedList(documentListSections, documentCategories, context, researchEntityService, EventsService, AuthService) {
        const vm = this;

        const DocumentsService = context.getDocumentService();
        const subResearchEntity = context.getSubResearchEntity();

        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.exportCsvDocuments = documents => DocumentsService.exportDocuments(documents, 'csv');
        vm.exportExcelDocuments = documents => DocumentsService.exportDocuments(documents, 'excel');
        vm.exportBibtexDocuments = documents => DocumentsService.exportDocuments(documents, 'bibtex');

        vm.onFilter = onFilter;

        let query = {};

        vm.documentListSections = documentListSections;
        vm.documentCategories = documentCategories;

        vm.$onInit = function () {
            vm.editable = !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_VERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DOCUMENT_UNVERIFIED,
                EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED,
                EventsService.DOCUMENT_AUTORSHIP_PRIVACY_UPDATED,
                EventsService.DOCUMENT_AUTORSHIP_FAVORITE_UPDATED,
                EventsService.DOCUMENT_COMPARE
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            return researchEntityService.getDocuments(subResearchEntity, query, favorites)
                .then(function (documents) {
                    vm.documents = documents;
                });

        }
    }

})();