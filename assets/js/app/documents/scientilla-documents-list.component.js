/* global Scientilla */

(function () {
    'use strict';


    angular.module('documents')
        .component('scientillaDocumentsList', {
            templateUrl: 'partials/scientillaDocumentsList.html',
            controller: scientillaDocumentsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: "=",
                editable: "<"
            }
        });


    scientillaDocumentsList.$inject = [
        'context',
        'researchEntityService',
        'documentSearchForm',
        'EventsService'
    ];

    function scientillaDocumentsList(context, researchEntityService, documentSearchForm, EventsService) {
        var vm = this;

        var DocumentsService = context.getDocumentService();

        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;

        vm.onFilter = onFilter;

        vm.searchForm = documentSearchForm;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_VERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DRAFT_UNVERIFIED,
                EventsService.DOCUMENT_USER_TAGS_UPDATED
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
