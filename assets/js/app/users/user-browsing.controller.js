(function () {
    angular
            .module('users')
            .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        '$location',
        'UsersService',
        'AuthService',
        'ModalService'
    ];

    function UserBrowsingController($location, UsersService, AuthService, ModalService) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;

        activate();

        function activate() {
            return getUsers().then(function () {

            });
        }

        function getUsers() {
            return UsersService.getList({
                populate: ['memberships', 'references']
            }).then(function (data) {
                vm.users = data;
                return vm.users;
            });
        }

        function createNew() {
            openUserForm();
        }

        function viewUser(user) {
            $location.path('/users/' + user.id);
        }

        function editUser(user) {
            openUserForm(user);
        }

        function deleteUser(user) {
            user.remove()
                    .then(function () {
                        _.remove(vm.users, user);
                    });
        }

        // private
        function openUserForm(user) {
            ModalService
                    .openScientillaUserForm(!user ? UsersService.getNewUser() : user.clone())
                    .then(function () {
                        getUsers();
                    });
        }

    }
})();