(function () {
    angular
            .module('groups')
            .controller('GroupDetailsController', GroupDetailsController);

    GroupDetailsController.$inject = [
        'group'
    ];

    function GroupDetailsController(group) {
        var vm = this;        
        vm.group = group;

        activate();

        function activate() {
            return getReferences().then(function () {

            });
        }

        function getReferences() {
            return group.getList('references', {populate: ['owner', 'collaborators'], status:[Scientilla.reference.VERIFIED, Scientilla.reference.PUBLIC]})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }
    }
})();
