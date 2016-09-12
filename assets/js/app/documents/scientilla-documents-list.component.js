/* global Scientilla */

(function () {
    'use strict';


    angular.module('references')
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
        'DocumentsServiceFactory',
        'researchEntityService',
        'documentSearchForm',
        'EventsService'
    ];

    function scientillaDocumentsList(DocumentsServiceFactory, researchEntityService, documentSearchForm,EventsService) {
        var vm = this;
        
        var DocumentsService = DocumentsServiceFactory.create(vm.researchEntity);
        
        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;

        vm.getData = getDocuments;
        vm.onFilter = refreshList;

        vm.searchForm = documentSearchForm;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_VERIFIED,
                EventsService.DRAFT_UNVERIFIED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function getDocuments(q) {
            query = q;
            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function refreshList(documents) {
            vm.documents = documents;
        }

        //private
        function updateList() {
            getDocuments(query).then(refreshList);
        }
    }

})();
