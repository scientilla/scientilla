(function () {
    angular
        .module('users')
        .controller('UserBrowsingController', UserBrowsingController);

    UserBrowsingController.$inject = [
        'UsersService',
        'PeopleService',
        'Notification',
        'AuthService',
        'ModalService',
        'userConstants',
        '$location',
        'GroupsService',
        'researchEntityService'
    ];

    function UserBrowsingController(
        UsersService,
        PeopleService,
        Notification,
        AuthService,
        ModalService,
        userConstants,
        $location,
        GroupsService,
        researchEntityService
    ) {
        const vm = this;

        vm.user = AuthService.user;
        vm.viewUser = viewUser;
        vm.deleteUser = deleteUser;
        vm.editUser = editUser;
        vm.createNew = createNew;
        vm.loginAs = loginAs;
        vm.getUserProfile = getUserProfile;
        vm.socialClass = socialClass;

        vm.onFilter = onFilter;
        let query = {};
        vm.groups = [];

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

        /* jshint ignore:start */
        async function onFilter(q, isRefreshing = false) {

            if (_.isEmpty(vm.groups)) {
                vm.groups = await GroupsService.getGroups();
            }

            let memberships = [];
            let subgroups = true;
            let formerEmployees = false;
            let group = false;
            let groupWhere = {};

            query = q;

            if (isRefreshing) {
                if (_.has(query, 'where.active')) {
                    formerEmployees = !query.where.active;
                    delete query.where.active;
                } else {
                    formerEmployees = true;
                }
            } else {
                if (_.has(query, 'where.formerEmployees')) {
                    formerEmployees = query.where.formerEmployees;
                    delete query.where.formerEmployees;
                }
            }

            if (_.has(query, 'where.group')) {
                group = query.where.group;
                delete query.where.group;

                if (group === 1) {
                    group = false;
                }
            }

            if (group) {
                if (formerEmployees) {
                    groupWhere = {
                        activeAndFormerMembershipsIncludingSubgroups: {
                            like: `%-${ group }-%`
                        }
                    };
                } else {
                    groupWhere = {
                        activeMembershipsIncludingSubgroups: {
                            like: `%-${ group }-%`
                        }
                    };
                }
            }

            query.where = Object.assign({}, query.where, groupWhere);
            query.where.role = [userConstants.role.ADMINISTRATOR, userConstants.role.SUPERUSER, userConstants.role.USER];

            if (formerEmployees) {
                delete query.where.active;
            } else {
                query.where.active = true;
            }

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
                if (subgroups) {
                    memberships = await researchEntityService.getAllMemberships(group, {
                        where: {
                            group: group,
                            user: members.map(m => m.id)
                        }
                    });
                } else {
                    memberships = await researchEntityService.getMemberships(group, {
                        where: {
                            user: members.map(m => m.id)
                        }
                    });
                }
            }

            if (members.length > 0 && memberships.length > 0) {
                members.forEach(member => {
                    member.membership = memberships.find(m => m.user === member.id && m.group === group);
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

            vm.users = members;
            return vm.users;
        }
        /* jshint ignore:end */

        function createNew() {
            openUserForm();
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
                .then(refreshList);
        }

        function refreshList() {
            onFilter(query, true);
        }

        function getUserProfile(user) {
            if (_.has(user, 'userData') && user.userData[0]) {
                return user.userData[0];
            }

            return {};
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