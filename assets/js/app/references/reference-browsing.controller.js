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
        vm.createNewUrl = (vm.researchEntity.getType ==='user') ? "/users/" + researchEntity.id + "/references/new" : "/groups/" + researchEntity.id + "/references/new";
        vm.editUrl = (vm.researchEntity.getType ==='user') ? '#/users/' + researchEntity.id + '/edit' : '#/groups/' + researchEntity.id + '/edit';

        activate();

        function activate() {
            return getReferences().then(function () {

            });
        }

        function getReferences() {
            return researchEntity.getList('references', { populate: ['publicCoauthors', 'privateCoauthors']})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }

        function deleteReference(reference) {
            ReferencesService.delete(reference)
                    .then(function () {
                        _.remove(vm.references, reference);
                    });
        }
        
        function verifyReference(reference) {
            return ReferencesService.verify(reference);
        }
    }
})();
