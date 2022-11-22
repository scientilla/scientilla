(function () {
    angular
        .module('groups')
        .component('scientillaGroupMembers', {
            controller: controller,
            templateUrl: 'partials/scientilla-group-members.html',
            controllerAs: 'vm',
            bindings: {
                group: '<',
                active: '<?'
            }
        });

    controller.$inject = [
        'documentListSections',
        'UsersService',
        'GroupsService',
        'AuthService',
        'ModalService',
        'PeopleService',
        '$element',
        'userConstants',
        '$scope',
        '$location',
        'EventsService'
    ];

    function controller(
        documentListSections,
        UsersService,
        GroupsService,
        AuthService,
        ModalService,
        PeopleService,
        $element,
        userConstants,
        $scope,
        $location,
        EventsService
    ) {
        const vm = this;

        vm.name = 'group-members';
        vm.shouldBeReloaded = true;

        vm.user = AuthService.user;
        vm.loggedUser = AuthService.loggedUser;
        vm.documentListSections = documentListSections;
        vm.removeCollaborator = removeCollaborator;
        vm.editCollaborator = editCollaborator;
        vm.getUsers = getUsers;
        vm.isAdmin = isAdmin;
        vm.showCollaboratorButton = showCollaboratorButton;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.loginAs = loginAs;
        vm.isGroupAdmin = isGroupAdmin;
        vm.socialClass = socialClass;

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

        let activeWatcher;

        vm.loadMembers = true;

        vm.$onInit = () => {
            const registerTab = requireParentMethod($element, 'registerTab');
            registerTab(vm);

            $scope.$on('refreshList', () => {
                refreshList();
            });

            if (_.has(vm, 'active')) {
                vm.loadMembers = angular.copy(vm.active);

                activeWatcher = $scope.$watch('vm.active', () => {
                    vm.loadMembers = angular.copy(vm.active);

                    if (vm.loadMembers) {
                        $scope.$broadcast('filter');
                    } else {
                        vm.members = [];
                    }
                });
            }
        };

        vm.$onDestroy = () => {
            const unregisterTab = requireParentMethod($element, 'unregisterTab');
            unregisterTab(vm);

            if (_.isFunction(activeWatcher)) {
                activeWatcher();
            }
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

            if (vm.group.id === 1 && subgroups && !formerMembers) {
                groupWhere = {};
            } else {
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
                        if (!_.has(group, 'offices')) {
                            continue;
                        }

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
                members.forEach(member => {

                    member.membership = member.memberships.find(m => m.person === member.id && m.group === vm.group.id);
                    if (!member.membership) {
                        return;
                    }
                    member.membership.isMember = false;

                    switch (true) {
                        case !member.membership.synchronized && member.membership.active :
                            member.membership.type = vm.membershipTypes.COLLABORATOR;
                            break;
                        case member.membership.synchronized && !member.membership.active :
                            member.membership.type = vm.membershipTypes.FORMER_MEMBER;
                            break;
                        case !member.membership.synchronized && !member.membership.active :
                            member.membership.type = vm.membershipTypes.FORMER_COLLABORATOR;
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
        }

        function isGroupAdmin() {
            return GroupsService.isGroupAdmin(vm.group, vm.loggedUser);
        }

        function isAdmin() {
            const user = AuthService.user;
            return user.isAdmin();
        }

        function showCollaboratorButton(m) {
            return isGroupAdmin() && m.membership &&
                [
                    vm.membershipTypes.COLLABORATOR.id,
                    vm.membershipTypes.FORMER_COLLABORATOR.id
                ].includes(m.membership.type.id);
        }

        function viewUser(user) {
            $location.url('/users/' + user.id);
        }

        function editUser(user) {
            openUserForm(user);
        }

        /* jshint ignore:start */
        async function deleteUser(user) {
            try {
                await UsersService.delete(user);
                refreshList();
                Notification.success("User deleted");
            } catch (error) {
                Notification.warning("Failed to delete user");
            }
        }
        /* jshint ignore:end */

        function loginAs(user) {
            AuthService.setupUserAccount(user.id);
        }

        // private
        function openUserForm(user) {
            ModalService
                .openScientillaUserForm(!user ? UsersService.getNewUser() : user.clone())
                .then(() => {
                    refreshList();
                    EventsService.publish(EventsService.GROUP_UPDATED, vm.group);
                });
        }

        function socialClass(social) {
            switch (true) {
                case social === 'linkedin':
                    return 'fab fa-linkedin';
                case social === 'twitter':
                    return 'fab fa-twitter';
                case social === 'facebook':
                    return 'fab fa-facebook-square';
                case social === 'instagram':
                    return 'fab fa-instagram';
                case social === 'researchgate':
                    return 'fab fa-researchgate';
                case social === 'googleScholar':
                    return 'fas fa-graduation-cap';
                case social === 'github':
                    return 'fab fa-github';
                case social === 'bitbucket':
                    return 'fab fa-bitbucket';
                case social === 'youtube':
                    return 'fab fa-youtube';
                case social === 'flickr':
                    return 'fab fa-flickr';
                default:
                    break;
            }
        }
    }
})();
