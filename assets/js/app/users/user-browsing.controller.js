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
        'GroupsService'
    ];

    function UserBrowsingController(
        UsersService,
        PeopleService,
        Notification,
        AuthService,
        ModalService,
        userConstants,
        $location,
        GroupsService
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

        function onFilter(q) {
            const groupsAreLoaded = new Promise((resolve, reject) => {
                if (_.isEmpty(vm.groups)) {
                    return GroupsService.getGroups().then(groups => {
                        vm.groups = groups;
                        return resolve(groups);
                    });
                } else {
                    return resolve(vm.groups);
                }
            });

            return groupsAreLoaded.then(groups => {
                query = q;
                query.where.role = [userConstants.role.ADMINISTRATOR, userConstants.role.SUPERUSER, userConstants.role.USER];

                return PeopleService.getPeople(query)
                    .then(users => {
                        for (const user of users) {
                            const centers = [];
                            if (_.has(user, 'groups')) {
                                for (const group of user.groups) {
                                    if (_.has(group, 'center.name')) {
                                        const duplicateGroup = centers.find(c => c.name === group.center.name);
                                        if (!duplicateGroup) {
                                            const center = groups.find(c => c.name === group.center.name);
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
                                        const tmpGroup = userGroups.find(c => c.code === group.code);
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

                        vm.users = users;
                        return vm.users;
                    });
            });
        }

        function createNew() {
            openUserForm();
        }

        function viewUser(user) {
            $location.url('/users/' + user.id);
        }

        function editUser(user) {
            openUserForm(user);
        }

        function deleteUser(user) {
            user.remove()
                .then(function () {
                    Notification.success("User deleted");

                    refreshList();

                })
                .catch(function () {
                    Notification.warning("Failed to delete user");
                });

        }

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
            onFilter(query);
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