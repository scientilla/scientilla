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
        'documentSearchForm',
        'ModalService'
    ];

    function scientillaDocumentsList($rootScope, Notification, researchEntityService, documentSearchForm, ModalService) {
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
            ModalService
                    .multipleChoiceConfirm('Unverifying','Do you want to unverify the document?', ['Create New Version', 'Unverify'])
                    .then(function (buttonIndex) {

                        researchEntityService.unverify(vm.researchEntity, document)
                                .then(function (draft) {
                                    draft.id = false;
                                    $rootScope.$broadcast('draft.unverified', {});
                                    switch(buttonIndex) {
                                        case 0: 
                                            openEditPopup(draft);
                                            break;
                                        case 1:
                                            Notification.success("Document succesfully unverified");
                                            break;
                                    }
                                    
                                })
                                .catch(function () {
                                    Notification.warning("Failed to unverify document");
                                });

                    })
                    .catch(function () {
                    });
        }

        function openEditPopup(draft) {
            ModalService
                    .openScientillaDocumentForm(draft.clone(), vm.researchEntity);
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
