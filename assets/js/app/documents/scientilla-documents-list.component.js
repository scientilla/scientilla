/* global Scientilla */

(function () {
    'use strict';


    angular.module('documents')
        .component('scientillaDocumentsList', {
            templateUrl: 'partials/scientilla-documents-list.html',
            controller: scientillaDocumentsList,
            controllerAs: 'vm',
            bindings: {
                category: '<',
                researchEntity: '<',
                section: '<'
            }
        });


    scientillaDocumentsList.$inject = [
        'context',
        'researchEntityService',
        'EventsService',
        'documentListSections',
        'AuthService',
        '$element',
        '$rootScope'
    ];

    function scientillaDocumentsList(
        context,
        researchEntityService,
        EventsService,
        documentListSections,
        AuthService,
        $element,
        $rootScope
    ) {
        const vm = this;

        const DocumentsService = context.getDocumentService();

        vm.name = 'documents-list';
        vm.shouldBeReloaded = true;

        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;
        vm.compareDocuments = DocumentsService.compareDocuments;
        vm.exportCsvDocuments = documents => DocumentsService.exportDocuments(documents, 'csv');
        vm.exportBibtexDocuments = documents => DocumentsService.exportDocuments(documents, 'bibtex');

        vm.onFilter = onFilter;

        let query = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            EventsService.unsubscribeAll(vm);
        };

        vm.reload = function () {

            EventsService.unsubscribeAll(vm);

            vm.editable = vm.section === documentListSections.VERIFIED && !AuthService.user.isViewOnly();

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
