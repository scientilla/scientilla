(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'ReferencesService',
        '$route',
        'researchEntity'
    ];

    function ReferenceBrowsingController(ReferencesService, $route, researchEntity) {
        var vm = this;
        
        vm.researchEntity = researchEntity;
        vm.deleteReference = deleteReference;
        vm.verifyReference = verifyReference;
        vm.createNewUrl = vm.researchEntity.getNewReferenceUrl();
        vm.editUrl = vm.researchEntity.getProfileUrl();
        vm.referenceStatusMap = {
            Public: Scientilla.reference.PUBLIC, 
            Private: Scientilla.reference.VERIFIED, 
            Drafts: Scientilla.reference.DRAFT
        }
        activate();

        function activate() {
        }

        function deleteReference(reference) {
            vm.researchEntity.one('references', reference.id).remove()
                    .then(function () {
                        _.remove(vm.researchEntity.references, reference);
                    });
        }
        
        function verifyReference(reference) {
            return vm.researchEntity.one('references', reference.id).customPUT({},'verified').then(function(r) {
                reference.draft = false;
                reference.status = Scientilla.reference.VERIFIED;
            });
        }
    }
})();
