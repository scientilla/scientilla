(function () {
    angular
        .module('users')
        .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        'UsersService',
        'Notification',
        'AuthService',
        'ModalService',
        '$location'
    ];

    function UserBrowsingController(UsersService, Notification, AuthService, ModalService, $location) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;
        vm.loginAs = loginAs;

        vm.onFilter = onFilter;
        var query = {};

        vm.searchForm = {
            name: {
                inputType: 'text',
                label: 'Name',
                matchColumn: 'name',
                matchRule: 'contains',
                type: 'field'
            },
            surname: {
                inputType: 'text',
                label: 'Surname',
                matchColumn: 'surname',
                matchRule: 'contains',
                type: 'field'
            }
        };

        function onFilter(q) {
            query = q;

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