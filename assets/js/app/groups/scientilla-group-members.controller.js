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
        'AuthService',
        'ModalService',
        'researchEntityService',
        '$element',
        '$rootScope',
        '$location'
    ];

    function controller(
        documentListSections,
        UsersService,
        GroupsService,
        AuthService,
        ModalService,
        researchEntityService,
        $element,
        $rootScope,
        $location
    ) {
        const vm = this;

        vm.name = 'group-members';
        vm.shouldBeReloaded = true;

        vm.documentListSections = documentListSections;
        vm.addCollaborator = addCollaborator;
        vm.removeCollaborator = removeCollaborator;
        vm.getUsers = getUsers;
        vm.isAdmin = isAdmin;

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

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);
        };

        vm.reload = function () {
            vm.isCollaborationManagementFormOpen = false;
            vm.selectedUserActive = true;
        };

        function getUsers(searchText) {
            const qs = {where: {or: [
                {name: {contains: searchText}},
                {surname: {contains: searchText}},
                {display_name: {contains: searchText}},
                {display_surname: {contains: searchText}}
            ]}};
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
                {proceed: 'Proceed'});

            if (buttonIndex === 'proceed') {
                await GroupsService.removeCollaborator(vm.group, user);
                refresh();
            }
        }

        async function onFilter(q) {
            let inherit = true;
            let members = [];
            let memberships = [];
            const where = {
                group: vm.group.id
            };

            const queryParams = $location.search();
            if (_.has(queryParams, 'inherit') && queryParams.inherit === 'false') {
                inherit = false;
            }

            query = q;

            if (inherit) {
                members = await researchEntityService.getAllMembers(vm.group, query);
                if (members.length > 0) {
                    where.user = members.map(m => m.id);
                    memberships = await researchEntityService.getAllMembershipsOfGroup(vm.group, {
                        where: where
                    });
                }
            } else {
                where.level = 0;
                memberships = await researchEntityService.getAllMembershipsOfGroup(vm.group, {
                    where: where
                });

                if (memberships.length > 0) {
                    query = _.merge(q, {
                        where: {
                            id: memberships.map(m => m.user)
                        }
                    });
                    members = await researchEntityService.getAllMembers(vm.group, query);
                }
            }

            if (members.length > 0 && memberships.length > 0) {
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

        function isAdmin() {
            return AuthService.isAdmin;
        }
    }
})();
