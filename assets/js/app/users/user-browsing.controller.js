(function () {
    angular
            .module('users')
            .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = ['UsersService', 'Restangular'];

    function UserBrowsingController(UsersService, Restangular) {
        var vm = this;

        vm.deleteUser = deleteUser;

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

        function deleteUser(user) {
            user.remove()
                    .then(function () {
                        _.remove(vm.users, user);
                    });
        }
    }
})();