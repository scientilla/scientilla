(function () {
    'use strict';

    angular.module('components')
        .component('scientillaMobileToolbar', {
            templateUrl: 'partials/scientilla-mobile-toolbar.html',
            controller: scientillaToolbar,
            controllerAs: 'vm'
        });

    scientillaToolbar.$inject = [
        'EventsService',
        'AuthService',
        'Settings',
        'context',
        'GroupsService',
        'UsersService',
        'ModalService',
        'path',
        'ResearchEntitiesService'
    ];

    function scientillaToolbar(
        EventsService,
        AuthService,
        Settings,
        context,
        GroupsService,
        UsersService,
        ModalService,
        path,
        ResearchEntitiesService
    ) {
        const vm = this;
        vm.wizardOpened = false;
        vm.isRegisterEnabled = false;
        vm.changeContextToGroup = changeContextToGroup;
        vm.changeContextToUser = changeContextToUser;
        vm.editUserProfile = editUserProfile;
        vm.editUserSettings = editUserSettings;
        vm.researchEntityIsUser = researchEntityIsUser;
        vm.openWizard = openWizard;
        vm.openSuggestedWizard = openSuggestedWizard;
        vm.profile = false;
        vm.isUser = isUser;
        vm.isGroup = isGroup;
        vm.getGroupTypeLabel = GroupsService.getGroupTypeLabel;
        vm.editGroupProfile = editGroupProfile;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            EventsService.subscribeAll(vm, [
                EventsService.USER_PROFILE_SAVED,
            ], (evt, profile) => {
                vm.profile = profile;

                refresh();
            });

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT,
                EventsService.CONTEXT_CHANGE
            ], refresh);

            EventsService.subscribeAll(vm, [
                EventsService.PROJECT_GROUP_CREATED,
                EventsService.PROJECT_GROUP_DELETED,
                EventsService.GROUP_UPDATED
            ], reloadUser);

            vm.profile = await ResearchEntitiesService.getProfile(AuthService.user.researchEntity);

            refresh();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        /* jshint ignore:start */
        async function reloadUser() {
            await AuthService.refreshUserAccount();
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            vm.groupsByType = _.groupBy(vm.user.administratedGroups, 'type');
        }
        /* jshint ignore:end */

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            vm.groupsByType = _.groupBy(vm.user.administratedGroups, 'type');
            Settings.getSettings()
                .then(function (settings) {
                    vm.isRegisterEnabled = settings.registerEnabled;
                });
            vm.subResearchEntity = context.getSubResearchEntity();
        }

        function changeContextToGroup(group) {
            return GroupsService.getGroup(group.id)
                .then(group => context.setSubResearchEntity(group))
                .then(() => {
                    path.goTo(group.slug + '/info');
                });
        }

        function changeContextToUser(user) {
            return UsersService.getUser(user.id)
                .then(user => context.setSubResearchEntity(user))
                .then(() => {
                    path.goTo('/dashboard');
                });
        }

        function editUserSettings() {
            let openForm;
            let researchEntityService;
            if (vm.subResearchEntity.getType() === 'user') {
                openForm = ModalService.openScientillaUserForm(vm.user, true);
                researchEntityService = UsersService;
            } else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }

            researchEntityService
                .getSettings(vm.subResearchEntity.id)
                .then(openForm)
                .then(function (status) {
                    if (status !== 1)
                        return vm.subResearchEntity;
                    return researchEntityService.getSettings(vm.subResearchEntity.id);
                })
                .then(function (subResearchEntity) {
                    vm.subResearchEntity = subResearchEntity;
                });

            document.body.classList.remove('mobile-menu-is-open');
        }

        function editUserProfile() {
            ModalService.openProfileForm();
        }

        function editGroupProfile() {
            ModalService.openGroupProfileForm(vm.subResearchEntity);
        }

        function researchEntityIsUser() {
            return vm.subResearchEntity.getType() === 'user';
        }

        function openWizard() {
            ModalService.openWizard([
                'new-features',
                'select-scientific-production',
                'scientific-production',
                'scopus-edit',
                'admin-tutorial',
            ], {
                isClosable: true,
                size: 'lg'
            });

            document.body.classList.remove('mobile-menu-is-open');
        }

        function openSuggestedWizard() {
            ModalService.openWizard(['alias-edit'], {
                isClosable: true,
                size: 'lg'
            });

            document.body.classList.remove('mobile-menu-is-open');
        }

        function isUser() {
            return vm.subResearchEntity.getType() === 'user';
        }

        function isGroup() {
            return vm.subResearchEntity.getType() === 'group';
        }
    }

})();
