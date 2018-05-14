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
        vm.viewGroup = viewGroup;
        vm.deleteGroup = deleteGroup;
        vm.editGroup = editGroup;
        vm.createNew = createNew;

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
                matchRule: 'contains'
            },
            type: {
                inputType: 'select',
                label: 'Type',
                matchColumn: 'type',
                values: typeSelectValues,
            },
            code: {
                inputType: 'text',
                label: 'CDR/CODE',
                matchColumn: 'code',
                matchRule: 'contains',
                ngIf: isAdmin
            },
            newline1: {
                inputType: 'br'
            },
            active: {
                inputType: 'checkbox',
                label: 'Active',
                matchColumn: 'active',
                defaultValue: true
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

        function isAdmin(){
            return vm.user.isAdmin();
        }

    }
})();