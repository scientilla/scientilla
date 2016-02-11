(function () {
    angular
            .module('users')
            .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        'UsersService', 
        'AuthService',
        '$mdDialog'
    ];

    function UserBrowsingController(UsersService, AuthService, $mdDialog) {
        var vm = this;
        
        vm.user = AuthService.user;
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
        
        function createNew($event, user) {
            $mdDialog.show({
                controller: "UserFormController",
                templateUrl: "partials/user-form.html",
                controllerAs: "vm",
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    user: UsersService.getNewUser()
                },
                fullscreen: true,
                clickOutsideToClose: true
            })
                    .then(function () {
                        getUsers();
                    });
        }

        function editUser($event, user) {
            $mdDialog.show({
                controller: "UserFormController",
                templateUrl: "partials/user-form.html",
                controllerAs: "vm",
                parent: angular.element(document.body),
                targetEvent: $event,
                locals: {
                    user: user.clone()
                },
                fullscreen: true,
                clickOutsideToClose: true
            })
                    .then(function () {
                        getUsers();
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