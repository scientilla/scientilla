(function () {
    angular
            .module('users')
            .controller('UserDetailsController', UserDetailsController);

    UserDetailsController.$inject = [
        'UsersService',
        'user'
    ];

    function UserDetailsController(UsersService, user) {
        var vm = this;        
        vm.user = user;

        activate();

        function activate() {
            return getReferences().then(function () {
                getCollaborations();
            });
        }

        function getReferences() {
            return user.getList('references', {populate: ['owner', 'collaborators'], status:[Scientilla.reference.VERIFIED, Scientilla.reference.PUBLIC]})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }
        
        function getCollaborations() {
            return UsersService.getCollaborations(vm.user);
        }
    }
})();
