(function () {
    angular
        .module('groups')
        .controller('GroupBrowsingController', GroupBrowsingController);

    GroupBrowsingController.$inject = [
        'GroupsService',
        'Notification',
        'AuthService',
        'ModalService',
        'groupTypes',
        'groupTypeLabels',
        '$location'
    ];

    function GroupBrowsingController(GroupsService, Notification, AuthService, ModalService, groupTypes, groupTypeLabels, $location) {
        const vm = this;

        vm.user = AuthService.user;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;
        vm.isAdmin = isAdmin;

        vm.onFilter = onFilter;
        let query = {};

        const typeSelectValues = [{
            value: '?',
            label: 'All'
        }].concat(
            Object.keys(groupTypes)
                .map(k => ({label: groupTypeLabels[k], value: groupTypes[k]}))
        );

        vm.searchForm = {
            name: {
                inputType: 'text',
                label: 'Name',
                matchColumn: 'name',
                matchRule: 'contains',
                type: 'field'
            },
            type: {
                inputType: 'select',
                label: 'Type',
                matchColumn: 'type',
                values: typeSelectValues,
                type: 'field'
            },
            code: {
                inputType: 'text',
                label: 'CDR/CODE',
                matchColumn: 'code',
                matchRule: 'contains',
                ngIf: isAdmin,
                type: 'field'
            },
            active: {
                inputType: 'checkbox',
                label: 'Active',
                matchColumn: 'active',
                defaultValue: true,
                type: 'action'
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

        function isAdmin(){
            return vm.user.isAdmin();
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