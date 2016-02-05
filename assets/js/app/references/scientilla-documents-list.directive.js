(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaDocumentsList', scientillaDocumentsList);

    function scientillaDocumentsList() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDocumentsList.html',
            controller: scientillaDocumentsListController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaDocumentsListController.$inject = [
        '$rootScope'
    ];

    function scientillaDocumentsListController($rootScope) {
        var vm = this;
        vm.documents = [];
        
        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();

        activate();
        
        function activate() {
            getDocuments();
            $rootScope.$on('draft.verified', getDocuments);
        }
        
        function getDocuments() {
            vm.researchEntity.getList('privateReferences',  {populate: ['privateCoauthors']})
                    .then(function(documents) {
                        Scientilla.toDocumentsCollection(documents);
                        vm.documents = documents;
                    });
        }

        function deleteDocument(reference) {
            vm.researchEntity.one('references', reference.id).remove()
                    .then(function () {
                        _.remove(vm.researchEntity.references, reference);
                    });
        }
        
        function verifyDocument(reference) {
            return vm.researchEntity.one('references', reference.id).customPUT({},'verified').then(function(r) {
                reference.draft = false;
                reference.status = Scientilla.reference.VERIFIED;
            });
        }
    }

})();