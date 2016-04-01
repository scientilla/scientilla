(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaDraftsList', scientillaDraftsList);

    function scientillaDraftsList() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDraftsList.html',
            controller: scientillaDrafsListController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaDrafsListController.$inject = [
        'ModalService',
        'researchEntityService',
        '$rootScope'
    ];

    function scientillaDrafsListController(ModalService, researchEntityService, $rootScope) {
        var vm = this;

        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.openEditPopup = openEditPopup;

        activate();

        function activate() {
            getDrafts();
            $rootScope.$on("draft.created", getDrafts);
            $rootScope.$on("draft.verified", getDrafts);
        }

        function getDrafts() {
            vm.researchEntity.getList('drafts')
                    .then(function (drafts) {
                        Scientilla.toDocumentsCollection(drafts);
                        vm.drafts = drafts;
                    });
        }

        function deleteDocument(draft) {
            vm.researchEntity.one('drafts', draft.id).remove()
                    .then(function () {
                        getDrafts();
                    });
        }

        function verifyDocument(reference) {
            return researchEntityService.verify(vm.researchEntity, reference)
                    .then(function (draft) {
                        $rootScope.$broadcast("draft.verified", draft);
                    });
        }

        function openEditPopup(document) {
            
            ModalService
                    .openScientillaDocumentForm(document.clone(),vm.researchEntity)
                    .finally(function () {
                    });
        }
    }

})();