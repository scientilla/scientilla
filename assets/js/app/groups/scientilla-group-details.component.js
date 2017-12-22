(function () {
    angular
        .module('groups')
        .component('scientillaGroupDetails', {
            controller: GroupDetailsController,
            templateUrl: 'partials/scientilla-group-details.html',
            controllerAs: 'vm',
            bindings: {
                groupId: '<'
            }
        });

    GroupDetailsController.$inject = [
        'documentListSections',
        "UsersService",
        "GroupsService",
        "AuthService",
        "ModalService"
    ];

    function GroupDetailsController(documentListSections, UsersService, GroupsService, AuthService, ModalService) {
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
            getUser();
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
                    return getUser();
                });
        }

        function getUser() {
            return GroupsService.getGroup(vm.groupId)
                .then(group => vm.group = group);
        }

        function removeCollaborator(group, user) {
            ModalService
                .multipleChoiceConfirm('Removing group member',
                    `Are you sure you want to remove ${user.getDisplayName()} from the group members?`,
                    ['Proceed'])
                .then(function (buttonIndex) {
                    switch (buttonIndex) {
                        case 0:
                            return GroupsService.removeCollaborator(group, user)
                                .then(() => getUser());
                    }
                });

        }

        function isAdmin() {
            return AuthService.isAdmin;
        }

    }
})();
