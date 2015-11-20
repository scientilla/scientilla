(function () {
    angular
            .module('groups')
            .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = ['GroupsService', 'Restangular'];

    function GroupBrowsingController(GroupsService, Restangular) {
        var vm = this;

        vm.deleteGroup = deleteGroup;

        activate();

        function activate() {
            return getGroups().then(function () {

            });
        }

        function getGroups() {
            return GroupsService.getList()
                    .then(function (data) {
                        vm.groups = data;
                        return vm.groups;
                    });
        }

        function deleteGroup(group) {
            group.remove()
                    .then(function () {
                        _.remove(vm.groups, group);
                    });
        }
    }
})();