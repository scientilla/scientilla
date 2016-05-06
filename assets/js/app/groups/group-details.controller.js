(function () {
    angular
            .module('groups')
            .controller('GroupDetailsController', GroupDetailsController);

    GroupDetailsController.$inject = [
        'group',
        'GroupsService',
        '$location'
    ];

    function GroupDetailsController(group, GroupsService, $location) {
        var vm = this;
        vm.group = group;

        activate();

        function activate() {
            if (!vm.group.id)
                return;

            GroupsService
                    .getGroupMemebers(vm.group.id)
                    .then(function (memberships) {
                        vm.group.memberships = memberships;
                    });
        }

    }
})();
