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
        'PeopleService',
        '$element',
        'userConstants',
        '$scope'
    ];

    function controller(
        documentListSections,
        UsersService,
        GroupsService,
        AuthService,
        ModalService,
        researchEntityService,
        PeopleService,
        $element,
        userConstants,
        $scope
    ) {
        const vm = this;

        vm.name = 'group-members';
        vm.shouldBeReloaded = true;

        vm.documentListSections = documentListSections;
        vm.removeCollaborator = removeCollaborator;
        vm.editCollaborator = editCollaborator;
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
        vm.groups = [];

        vm.onFilter = onFilter;
        let query = {};

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            $scope.$on('refreshList', () => {
                refreshList();
            });
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
                {displayName: {contains: searchText}},
                {displaySurname: {contains: searchText}}
            ]}};
            return UsersService.getUsers(qs);
        }

        function editCollaborator(member) {
            ModalService.openCollaboratorForm(vm.group, member)
                .then(refreshList);
        }

        /* jshint ignore:start */
        async function removeCollaborator(user) {
            const buttonIndex = await ModalService.multipleChoiceConfirm('Removing group member',
                `Are you sure you want to remove ${user.getDisplayName()} from the group members?`,
                {proceed: 'Proceed'});

            if (buttonIndex === 'proceed') {
                await GroupsService.removeCollaborator(vm.group, user);
                refreshList();
            }
        }

        async function onFilter(q, isRefreshing = false) {

            if (_.isEmpty(vm.groups)) {
                vm.groups = await GroupsService.getGroups();
            }

            let memberships = [];
            let subgroups = false;
            let formerMembers = false;
            let groupWhere = {};

            query = q;

            if (isRefreshing) {
                if (_.has(query, 'where.activeAndFormerMembershipsIncludingSubgroups')) {
                    formerMembers = true;
                    subgroups = true;
                    delete query.where.activeAndFormerMembershipsIncludingSubgroups;
                }

                if (_.has(query, 'where.activeAndFormerMemberships')) {
                    formerMembers = true;
                    delete query.where.activeAndFormerMemberships;
                }

                if (_.has(query, 'where.activeMembershipsIncludingSubgroups')) {
                    subgroups = true;
                    delete query.where.activeMembershipsIncludingSubgroups;
                }

                if (_.has(query, 'where.activeMemberships')) {
                    delete query.where.activeMemberships;
                }
            } else {
                if (_.has(query, 'where.subgroups')) {
                    subgroups = query.where.subgroups;
                    delete query.where.subgroups;
                }

                if (_.has(query, 'where.formerMembers')) {
                    formerMembers = query.where.formerMembers;
                    delete query.where.formerMembers;
                }
            }

            switch (true) {
                case subgroups && formerMembers:
                    groupWhere = {
                        activeAndFormerMembershipsIncludingSubgroups: {
                            like: `%-${ vm.group.id }-%`
                        }
                    };
                    break;
                case !subgroups && formerMembers:
                    groupWhere = {
                        activeAndFormerMemberships: {
                            like: `%-${ vm.group.id }-%`
                        }
                    };
                    break;
                case subgroups && !formerMembers:
                    groupWhere = {
                        activeMembershipsIncludingSubgroups: {
                            like: `%-${ vm.group.id }-%`
                        }
                    };
                    break;
                default:
                    groupWhere = {
                        activeMemberships: {
                            like: `%-${ vm.group.id }-%`
                        }
                    };
                    break;
            }

            query.where = Object.assign({}, query.where, groupWhere);
            query.where.active = true;
            query.where.role = [userConstants.role.ADMINISTRATOR, userConstants.role.SUPERUSER, userConstants.role.USER];

            const members = await PeopleService.getPeople(query);
            for (const user of members) {
                const centers = [];
                if (_.has(user, 'groups')) {
                    for (const group of user.groups) {
                        if (_.has(group, 'center.name')) {
                            const duplicateGroup = centers.find(c => c.name === group.center.name);
                            if (!duplicateGroup) {
                                const center = vm.groups.find(c => c.name === group.center.name);
                                if (center) {
                                    centers.push(center);
                                }
                            }
                        }
                    }
                }

                const offices = [];
                if (_.has(user, 'groups')) {
                    for (const group of user.groups) {
                        for (const office of group.offices) {
                            const duplicateOffice = offices.find(o => o.name === office);
                            if (!duplicateOffice) {
                                offices.push(office);
                            }
                        }
                    }
                }

                const userGroups = [];
                if (_.has(user, 'groups')) {
                    for (const group of user.groups) {
                        const duplicateGroup = userGroups.find(c => c.code === group.code);
                        if (_.has(group, 'name') && !duplicateGroup) {
                            const tmpGroup = vm.groups.find(c => c.code === group.code);
                            if (tmpGroup) {
                                userGroups.push(tmpGroup);
                            }
                        }
                    }
                }

                user.centers = centers;
                user.offices = offices;
                user.groups = userGroups;
            }

            if (members.length > 0) {
                if (subgroups) {
                    memberships = await researchEntityService.getAllMemberships(vm.group.id, {
                        where: {
                            group: vm.group.id,
                            user: members.map(m => m.id)
                        }
                    });
                } else {
                    memberships = await researchEntityService.getMemberships(vm.group.id, {
                        where: {
                            user: members.map(m => m.id)
                        }
                    });
                }
            }

            if (members.length > 0 && memberships.length > 0) {
                members.forEach(member => {
                    member.membership = memberships.find(m => m.user === member.id && m.group === vm.group.id);
                    if (!member.membership) {
                        return;
                    }
                    member.membership.isMember = false;

                    switch (true) {
                        case !member.membership.synchronized && member.membership.active :
                            member.membership.type = vm.membershipTypes.COLLABORATOR;
                            member.cssClass = 'collaborator';
                            break;
                        case member.membership.synchronized && !member.membership.active :
                            member.membership.type = vm.membershipTypes.FORMER_MEMBER;
                            member.cssClass = 'former';
                            break;
                        case !member.membership.synchronized && !member.membership.active :
                            member.membership.type = vm.membershipTypes.FORMER_COLLABORATOR;
                            member.cssClass = 'former';
                            break;
                        default:
                            member.membership.type = vm.membershipTypes.MEMBER;
                            member.membership.isMember = true;
                            break;
                    }
                });
            }

            vm.members = members;

            return vm.members;
        }
        /* jshint ignore:end */

        function refreshList() {
            onFilter(query, true);
            vm.refreshGroup()();
        }

        function isAdmin() {
            const user = AuthService.user;
            return user.isAdmin();
        }
    }
})();
