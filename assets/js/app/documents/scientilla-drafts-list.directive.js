/* global Scientilla */

(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaDraftsList', {
            templateUrl: 'partials/scientillaDraftsList.html',
            controller: scientillaDrafsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaDrafsList.$inject = [
        'context',
        'researchEntityService',
        'documentSearchForm',
        'documentListSections',
        'EventsService'
    ];

    function scientillaDrafsList(context, researchEntityService, documentSearchForm, documentListSections, EventsService) {
        var vm = this;

        var DocumentsService = context.getDocumentService();

        vm.onFilter = onFilter;

        vm.deleteDraft = DocumentsService.deleteDraft;
        vm.verifyDraft = DocumentsService.verifyDraft;
        vm.openEditPopup = DocumentsService.openEditPopup;
        vm.openDocumentAffiliationForm = DocumentsService.openDocumentAffiliationForm;
        vm.deleteDrafts = DocumentsService.deleteDrafts;
        vm.verifyDrafts = DocumentsService.verifyDrafts;
        vm.synchronizeDraft = DocumentsService.synchronizeDraft;
        vm.desynchronizeDrafts = DocumentsService.desynchronizeDrafts;

        vm.searchForm = documentSearchForm;
        vm.documentListSections = documentListSections;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_DELETED,
                EventsService.DRAFT_UPDATED,
                EventsService.DRAFT_CREATED,
                EventsService.DRAFT_VERIFIED,
                EventsService.DRAFT_UNVERIFIED,
                EventsService.DRAFT_SYNCHRONIZED,
                EventsService.DOCUMENT_PRIVATE_TAGS_UPDATED
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

            return researchEntityService.getDrafts(vm.researchEntity, q)
                .then(function (documents) {
                    vm.drafts = documents;
                });
        }

    }

})();
