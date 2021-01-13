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
        '$location'
    ];

    function UserBrowsingController(
        UsersService,
        PeopleService,
        Notification,
        AuthService,
        ModalService,
        userConstants,
        $location
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
        vm.getUniqueCenters = getUniqueCenters;
        vm.getUniqueGroups = getUniqueGroups;
        vm.getUniqueOffices = getUniqueOffices;

        vm.onFilter = onFilter;
        let query = {};

        function onFilter(q) {
            query = q;

            query.where.role = [userConstants.role.ADMINISTRATOR, userConstants.role.SUPERUSER, userConstants.role.USER];

            return PeopleService.getPeople(query)
                .then(function (users) {
                    vm.users = users;
                    return vm.users;
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

        function getUniqueCenters(profile) {
            const centers = [];

            if (_.has(profile, 'groups')) {
                for (const group of profile.groups) {
                    if (_.has(group, 'center.name') && !centers.includes(group.center.name)) {
                        centers.push(group.center.name);
                    }
                }
            }

            return centers;
        }

        function getUniqueGroups(profile) {
            const groups = [];

            if (_.has(profile, 'groups')) {
                for (const group of profile.groups) {
                    if (_.has(group, 'name') && !groups.includes(group.name)) {
                        groups.push(group.name);
                    }
                }
            }

            return groups;
        }

        function getUniqueOffices(profile) {
            const offices = [];

            if (_.has(profile, 'groups')) {
                for (const group of profile.groups) {
                    if (_.has(group, 'offices')) {
                        for (const office of group.offices) {
                            if (!offices.includes(office)) {
                                offices.push(office);
                            }
                        }
                    }
                }
            }

            return offices;
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