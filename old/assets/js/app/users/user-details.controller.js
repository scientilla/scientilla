(function () {
    angular
        .module('users')
        .controller('UserDetailsController', UserDetailsController);

    UserDetailsController.$inject = [
        'UsersService',
        'user',
        'documentListSections'
    ];

    function UserDetailsController(UsersService, user, documentListSections) {
        var vm = this;
        vm.user = user;
        vm.documentListSections = documentListSections;

        activate();

        function activate() {
            getCollaborations();
        }

        function getCollaborations() {
            return UsersService.getCollaborations(vm.user);
        }
    }
})();
