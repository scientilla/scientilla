(function () {
    angular
        .module('groups')
        .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        'GroupsService',
        'Notification',
        'ModalService',
        'AuthService'
    ];

    function GroupBrowsingController(GroupsService, Notification, ModalService, AuthService) {
        const vm = this;

        vm.user = AuthService.user;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

        vm.onFilter = onFilter;
        let query = {};

        function createNew() {
            openGroupForm();
        }

        function onFilter(q) {
            query = q;

            return GroupsService.getGroups(query)
                .then(function (groups) {
                    vm.groups = groups;
                    return vm.groups;
                });
        }

        function deleteGroup(group) {
            group.remove()
                .then(function () {
                    Notification.success("Group deleted");
                    refreshList();
                })
                .catch(function () {
                    Notification.warning("Failed to delete group");
                });
        }

        function editGroup(group) {
            openGroupForm(group);
        }

        // private
        function openGroupForm(group) {
            ModalService
                .openScientillaGroupForm(!group ? GroupsService.getNewGroup() : group.clone())
                .then(function () {
                    refreshList();
                });
        }

        function refreshList() {
            onFilter(query);
        }

    }
})();