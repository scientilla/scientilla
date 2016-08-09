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
        '$rootScope',
        'DocumentsServiceFactory',
        'researchEntityService',
        'documentSearchForm'
    ];

    function scientillaDocumentsList($rootScope, DocumentsServiceFactory, researchEntityService, documentSearchForm) {
        var vm = this;
        
        var DocumentsService = DocumentsServiceFactory.create(vm.researchEntity);
        
        vm.documents = [];

        vm.unverifyDocument = DocumentsService.unverifyDocument;

        vm.getData = getDocuments;
        vm.onFilter = refreshList;

        vm.searchForm = documentSearchForm;

        var query = {};

        activate();

        function activate() {
            $rootScope.$on('draft.verified', updateList);
            $rootScope.$on('draft.unverified', updateList);
        }

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
