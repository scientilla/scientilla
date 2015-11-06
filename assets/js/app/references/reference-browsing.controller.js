(function () {
    angular
            .module('references')
            .controller('ReferenceBrowsingController', ReferenceBrowsingController);

    ReferenceBrowsingController.$inject = [
        'ReferencesService',
        'Restangular',
        'AuthService',
        '$route',
        'user'
    ];

    function ReferenceBrowsingController(ReferencesService, Restangular, AuthService, $route, user) {
        var vm = this;

        vm.deleteReference = deleteReference;

        vm.isOwner = ($route.current.params.id == AuthService.user.id);

        activate();

        function activate() {
            return getReferences().then(function () {

            });
        }

        function getReferences() {
            return user.getList('references', {populate: ['owner', 'collaborators']})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
            //sTODO: with deep populate
            return user.getList({populate: 'collaborators'})
//            return Restangular.all('references')
//                    .getList({owner: $route.current.params.id, populate: 'collaborators'})
                    .then(function (data) {
                        vm.references = data;
                        vm.references = Restangular.restangularizeCollection(null, vm.references, 'references');
                        return vm.references;
                    });
        }

        function deleteReference(reference) {
//            reference.remove(reference)
            ReferencesService.delete(reference)
                    .then(function () {
                        vm.references = _.remove(vm.references, reference);
                    });
        }
    }
})();
