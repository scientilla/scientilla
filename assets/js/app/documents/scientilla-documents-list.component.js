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
        'Notification',
        'researchEntityService',
        'documentSearchForm'
    ];

    function scientillaDocumentsList($rootScope, Notification, researchEntityService, documentSearchForm) {
        var vm = this;
        vm.documents = [];

        vm.unverifyDocument = unverifyDocument;

        vm.getData = getDocuments;
        vm.onFilter = refreshList;

        vm.searchForm = documentSearchForm;

        var query = {};

        activate();

        function activate() {
            $rootScope.$on('draft.verified', updateList);
        }

        function getDocuments(q) {
            query = q;
            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function unverifyDocument(reference) {
            vm.researchEntity
                    .one('references', reference.id)
                    .remove()
                    .then(function (documents) {
                        Notification.success("Document succesfully unverified");
                        updateList(documents);
                    })
                    .catch(function () {
                        Notification.warning("Failed to unverify document");
                    });
        }

        function refreshList(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
        }

        //private
        function updateList() {
            getDocuments(query).then(refreshList);
        }
    }

})();