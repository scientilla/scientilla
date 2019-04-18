(function () {
    angular
        .module('users')
        .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        'UsersService',
        'Notification',
        'AuthService',
        'ModalService',
        'userConstants',
        '$location'
    ];

    function UserBrowsingController(UsersService, Notification, AuthService, ModalService, userConstants, $location) {
        const vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;
        vm.loginAs = loginAs;

        vm.onFilter = onFilter;
        let query = {};

        function onFilter(q) {
            query = q;

            query.where.role = [userConstants.role.ADMINISTRATOR, userConstants.role.USER];

            return UsersService.getUsers(query)
                .then(function (users) {
                    vm.users = users;
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
                    Notification.success("User deleted");

                    refreshList();

                })
                .catch(function () {
                    Notification.warning("Failed to delete user");
                });

        }

        function loginAs(user) {
            AuthService.setupUserAccount(user.id);
        }

        // private
        function openUserForm(user) {
            ModalService
                .openScientillaUserForm(!user ? UsersService.getNewUser() : user.clone())
                .then(refreshList);
        }

        function refreshList() {
            onFilter(query);
        }

    }
})();