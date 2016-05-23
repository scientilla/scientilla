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
        'ModalService',
        'researchEntityService',
        'documentSearchForm'
    ];

    function scientillaDocumentsList($rootScope, Notification, ModalService, researchEntityService, documentSearchForm) {
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
            $rootScope.$on('draft.unverified', updateList);
        }

        function getDocuments(q) {
            query = q;
            return researchEntityService.getDocuments(vm.researchEntity, query);
        }

        function unverifyDocument(document) {
            researchEntityService.unverify(vm.researchEntity, document)
                    .then(function (draft) {
                        Notification.success("Document succesfully unverified");
                        $rootScope.$broadcast('draft.unverified', {});
                        openEditPopup(draft);
                    })
                    .catch(function () {
                        Notification.warning("Failed to unverify document");
                    });
        }

        function openEditPopup(draft) {
            ModalService
                    .openScientillaDocumentForm(draft.clone(), vm.researchEntity)
                    .finally(function () {
                        updateList();
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