/* global Scientilla */

(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDraftsList', {
            templateUrl: 'partials/scientilla-drafts-list.html',
            controller: scientillaDrafsList,
            controllerAs: 'vm',
            bindings: {
            }
        });

    scientillaDrafsList.$inject = [
        'context',
        'researchEntityService',
        'documentListSections',
        'EventsService',
        'documentCategories'
    ];

    function scientillaDrafsList(context,
                                 researchEntityService,
                                 documentListSections,
                                 EventsService,
                                 documentCategories) {
        var vm = this;

        var DocumentsService = context.getDocumentService();
        const subResearchEntity = context.getSubResearchEntity();

        vm.onFilter = onFilter;

        vm.deleteDraft = DocumentsService.deleteDraft;
        vm.verifyDraft = DocumentsService.verifyDraft;
        vm.openEditPopup = DocumentsService.openEditPopup;
        vm.openDocumentAffiliationForm = DocumentsService.openDocumentAffiliationForm;
        vm.openDocumentAuthorsForm = DocumentsService.openDocumentAuthorsForm;
        vm.deleteDrafts = DocumentsService.deleteDrafts;
        vm.verifyDrafts = DocumentsService.verifyDrafts;
        vm.synchronizeDraft = DocumentsService.synchronizeDraft;
        vm.desynchronizeDrafts = DocumentsService.desynchronizeDrafts;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.documentCategories = documentCategories;

        vm.documentListSections = documentListSections;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_DELETED,
                EventsService.DRAFT_UPDATED,
                EventsService.DRAFT_CREATED,
                EventsService.DRAFT_VERIFIED,
                EventsService.DOCUMENT_UNVERIFIED,
                EventsService.DRAFT_SYNCHRONIZED,
                EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED,
                EventsService.DOCUMENT_DISCARDED,
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

            return researchEntityService.getDrafts(subResearchEntity, q)
                .then(function (documents) {
                    vm.drafts = documents;
                });
        }

    }

})();
