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
        
        vm.researchEntity = user;
        vm.deleteReference = deleteReference;
        vm.canCreate = ($route.current.params.id == AuthService.user.id);
        vm.createNewUrl = "/users/" + user.id + "/references/new";
        vm.editUrl = '#/users/' + user.id + '/edit';

        activate();

        function activate() {
            return getReferences().then(function () {

            });
        }

        function getReferences() {
            return user.getList('draftReferences')
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }

        function deleteReference(reference) {
//            reference.remove(reference)
            ReferencesService.delete(reference)
                    .then(function () {
                        _.remove(vm.references, reference);
                    });
        }
    }
})();
