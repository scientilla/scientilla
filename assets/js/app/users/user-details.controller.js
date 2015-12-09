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
            });
        }

        function getReferences() {
            return user.getList('references', {filter: 'verified', populate: ['publicCoauthors', 'privateCoauthors', 'privateGroups', 'publicGroups']})
                    .then(function (references) {
                        vm.references = references;
                        return vm.references;
            });
        }
    }
})();
