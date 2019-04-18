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
        'UsersService',
        'GroupsService',
        'ModalService',
        'researchEntityService'
    ];

    function controller(documentListSections, UsersService, GroupsService, ModalService, researchEntityService) {
        const vm = this;
        vm.documentListSections = documentListSections;
        vm.addCollaborator = addCollaborator;
        vm.removeCollaborator = removeCollaborator;
        vm.getUsers = getUsers;

        vm.membershipTypes = {
            MEMBER: {
                id: 0,
                label: 'Member'
            },
            COLLABORATOR: {
                id: 1,
                label: 'Collaborator'
            },
            FORMER_MEMBER: {
                id: 2,
                label: 'Former member'
            },
            FORMER_COLLABORATOR: {
                id: 3,
                label: 'Former collaborator'
            }
        };

        vm.members = [];

        vm.onFilter = onFilter;
        let query = {};

        vm.$onInit = function () {
            vm.isCollaborationManagementFormOpen = false;
            vm.selectedUserActive = true;
        };

        function getUsers(searchText) {
            const qs = {where: {or: [{name: {contains: searchText}}, {surname: {contains: searchText}}]}};
            return UsersService.getUsers(qs);
        }

        /* jshint ignore:start */

        async function addCollaborator(group, user, active) {
            try {
                await GroupsService.addCollaborator(group, user, active);
            } catch (e) {
                delete vm.selectedUser;
                return;
            }

            delete vm.selectedUser;
            refresh();
        }

        async function removeCollaborator(user) {
            const buttonIndex = await ModalService.multipleChoiceConfirm('Removing group member',
                `Are you sure you want to remove ${user.getDisplayName()} from the group members?`,
                ['Proceed']);

            switch (buttonIndex) {
                case 0:
                    await GroupsService.removeCollaborator(vm.group, user);
                    refresh();
            }

        }

        async function onFilter(q) {
            query = q;

            const members = await researchEntityService.getAllMembers(vm.group, query);
            let memberships;

            if (members.length > 0) {
                memberships = await researchEntityService.getAllMemberships(vm.group, {
                    where: {
                        group: vm.group.id,
                        user: members.map(m => m.id)
                    }
                });

                members.forEach(member => {
                    member.membership = memberships.find(m => m.user === member.id);
                    member.membership.type = member.membership.synchronized && member.membership.active ? vm.membershipTypes.MEMBER :
                        !member.membership.synchronized && member.membership.active ? vm.membershipTypes.COLLABORATOR :
                            member.membership.synchronized && !member.membership.active ? vm.membershipTypes.FORMER_MEMBER :
                                !member.membership.synchronized && !member.membership.active ? vm.membershipTypes.FORMER_COLLABORATOR : undefined;

                    member.cssClass = member.membership.type === vm.membershipTypes.COLLABORATOR ? 'collaborator' :
                        [vm.membershipTypes.FORMER_MEMBER, vm.membershipTypes.FORMER_COLLABORATOR].includes(member.membership.type) ? 'former-collaborator' : {};

                });
            }

            vm.members = members;
        }

        function refresh() {
            onFilter(query);
            vm.refreshGroup()();
        }

        /* jshint ignore:end */
    }
})();
