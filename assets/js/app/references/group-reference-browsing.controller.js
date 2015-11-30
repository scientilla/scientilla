(function () {
    angular
            .module('references')
            .controller('GroupReferenceBrowsingController', GroupReferenceBrowsingController);

    GroupReferenceBrowsingController.$inject = [
        'ReferencesService',
        'AuthService',
        '$route',
        'group'
    ];

    function GroupReferenceBrowsingController(ReferencesService, AuthService, $route, group) {
        var vm = this;
        
        vm.researchEntity = group;
        vm.deleteReference = deleteReference;
        vm.canCreate = (_.contains(_.map(AuthService.user.admininstratedGroups, 'id'), group.id));
        //sTODO: rethink and refactor
        vm.createNewUrl = "/groups/" + group.id + "/references/new";
        vm.editUrl = "#/groups/" + group.id;

        activate();

        function activate() {
            return getReferences().then(function () {

            });
        }

        function getReferences() {
            return group.getList('references', {populate: ['collaborators']})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }

        function deleteReference(reference) {
            reference.remove()
                    .then(function () {
                        _.remove(vm.references, reference);
                    });
        }
    }
})();
