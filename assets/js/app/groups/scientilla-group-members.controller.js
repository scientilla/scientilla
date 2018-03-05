(function () {
    angular
        .module('groups')
        .component('scientillaGroupMembers', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-members.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                refreshGroup: '&'
            }
        });

    controller.$inject = [
        'documentListSections',
        "UsersService",
        "GroupsService",
        "AuthService",
        "ModalService"
    ];

    function controller(documentListSections, UsersService, GroupsService, AuthService, ModalService) {
        const vm = this;
        vm.documentListSections = documentListSections;
        vm.openCollaboratorsManagementForm = openCollaboratorsManagementForm;
        vm.addCollaborator = addCollaborator;
        vm.removeCollaborator = removeCollaborator;
        vm.getUsers = getUsers;
        vm.isAdmin = isAdmin;

        vm.$onInit = function () {
            vm.isCollaborationManagementFormOpen = false;
            vm.selectedUserActive = true;
        };

        function openCollaboratorsManagementForm() {
            vm.isCollaborationManagementFormOpen = !vm.isCollaborationManagementFormOpen;
        }

        function getUsers(searchText) {
            const qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            return UsersService.getUsers(qs);
        }

        function addCollaborator(group, user, active) {
            return GroupsService.addCollaborator(group, user, active)
                .then(() => {
                    delete vm.selectedUser;
                    return vm.refreshGroup()();
                });
        }

        function removeCollaborator(user) {
            ModalService
                .multipleChoiceConfirm('Removing group member',
                    `Are you sure you want to remove ${user.getDisplayName()} from the group members?`,
                    ['Proceed'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                        case 0:
                            return GroupsService.removeCollaborator(vm.group, user)
                                .then(() => vm.refreshGroup()());
                    }
                });

        }

        function isAdmin() {
            return AuthService.isAdmin;
        }

    }
})();
