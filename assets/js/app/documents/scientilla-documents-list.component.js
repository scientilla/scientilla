/* global Scientilla */

(function () {
    'use strict';


    angular.module('documents')
        .component('scientillaDocumentsList', {
            templateUrl: 'partials/scientilla-documents-list.html',
            controller: scientillaDocumentsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<',
                section: '<'
            }
        });


    scientillaDocumentsList.$inject = [
        'context',
        'researchEntityService',
        'documentSearchForm',
        'EventsService',
        'documentListSections',
        'AuthService'
    ];

    function scientillaDocumentsList(context, researchEntityService, documentSearchForm, EventsService, documentListSections, AuthService) {
        const vm = this;

        const DocumentsService = context.getDocumentService();

        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.exportCsvDocuments = documents => DocumentsService.exportDocuments(documents, 'csv');
        vm.exportBibtexDocuments = documents => DocumentsService.exportDocuments(documents, 'bibtex');

        vm.onFilter = onFilter;

        vm.searchForm = documentSearchForm;

        let query = {};

        vm.$onInit = function () {
            vm.editable = vm.section === documentListSections.VERIFIED && !AuthService.user.isViewOnly();

            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_VERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DRAFT_UNVERIFIED,
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
            query = q;

            return researchEntityService.getDocuments(vm.researchEntity, query)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }
    }

})();
