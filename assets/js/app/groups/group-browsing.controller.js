(function () {
    angular
        .module('groups')
        .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        'GroupsService',
        'Notification',
        'AuthService',
        'ModalService',
        '$location'
    ];

    function GroupBrowsingController(GroupsService, Notification, AuthService, ModalService, $location) {
        var vm = this;

        vm.user = AuthService.user;
        vm.viewGroup = viewGroup;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

        vm.onFilter = onFilter;
        var query = {};

        vm.searchForm = {
            name: {
                inputType: 'text',
                label: 'Name',
                matchColumn: 'name',
                matchRule: 'contains'
            }
        };


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


        function viewGroup(g) {
            $location.path('/groups/' + g.id);
        }

        function deleteGroup(group) {
            group
                .remove()
                .then(function () {
                    Notification.success("User deleted");

                    getGroups()
                        .then(refreshList);

                })
                .catch(function () {
                    Notification.warning("Failed to delete user");
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
                    getGroups()
                        .then(refreshList);
                });
        }

    }
})();