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

    function scientillaDrafsListController() {
        var vm = this;
        
        vm.deleteDocument = deleteDocument;
        vm.verifyDocument = verifyDocument;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        vm.editUrl = vm.researchEntity.getProfileUrl();

        activate();
        
        function activate() {
            getDrafts();
        }
        
        function getDrafts() {
            vm.researchEntity.getList('drafts')
                    .then(function(drafts) {
                        Scientilla.toDocumentsCollection(drafts);
                        vm.drafts = drafts;
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