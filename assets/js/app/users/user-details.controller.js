(function () {
    angular
            .module('users')
            .controller('UserDetailsController', UserDetailsController);

    UserDetailsController.$inject = [
        'UsersService',
        'user',
        '$location'
    ];

    function UserDetailsController(UsersService, user, $location) {
        var vm = this;
        vm.user = user;

        activate();

        function activate() {
            getCollaborations();
        }

        function getCollaborations() {
            return UsersService.getCollaborations(vm.user);
        }
    }
})();
