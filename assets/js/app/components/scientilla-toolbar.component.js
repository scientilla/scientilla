(function () {
    'use strict';

    angular.module('components')
        .component('scientillaToolbar', {
            templateUrl: 'partials/scientilla-toolbar.html',
            controller: scientillaToolbar,
            controllerAs: 'vm'
        });

    scientillaToolbar.$inject = [
        '$scope',
        'EventsService',
        'AuthService',
        'Settings',
        'context',
        'GroupsService',
        'UsersService',
        'ModalService',
        'path'
    ];

    function scientillaToolbar($scope,
                               EventsService,
                               AuthService,
                               Settings,
                               context,
                               GroupsService,
                               UsersService,
                               ModalService,
                               path) {
        const vm = this;
        vm.wizardOpened = false;
        vm.isRegisterEnabled = false;
        vm.changeContextToGroup = changeContextToGroup;
        vm.changeContextToUser = changeContextToUser;
        vm.editUserSettings = editUserSettings;
        vm.showWizardVisible = showWizardVisible;
        vm.openWizard = openWizard;
        vm.openSuggestedWizard = openSuggestedWizard;
        vm.editUserProfile = editUserProfile;
        vm.getUrl = getUrl;

        vm.$onInit = function () {

            EventsService.subscribeAll(vm, [
                EventsService.USER_PROFILE_CHANGED,
            ], () => {
                AuthService.setupUserAccount(vm.user.id);
            });

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT,
                EventsService.CONTEXT_CHANGE
            ], refresh);

            refresh();
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        const prefix = '#/';
        let subResearchEntity = context.getSubResearchEntity();

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            Settings.getSettings()
                .then(function (settings) {
                    vm.isRegisterEnabled = settings.registerEnabled;
                });

            vm.subResearchEntity = context.getSubResearchEntity();
        }

        function changeContextToGroup(group) {
            return GroupsService.getGroup(group.id)
                .then(group => {
                    context.setSubResearchEntity(group);
                })
                .then(() => {
                    path.goTo('/' + group.slug + '/dashboard');
                });
        }

        function changeContextToUser(user) {
            return UsersService.getUser(user.id)
                .then(user => {
                    context.setSubResearchEntity(user);
                })
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
            }
            else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }

            researchEntityService
                .getUserSettings(vm.subResearchEntity.id)
                .then(openForm)
                .then(function (status) {
                    if (status !== 1)
                        return vm.subResearchEntity;
                    return researchEntityService.getUserSettings(vm.subResearchEntity.id);
                })
                .then(function (subResearchEntity) {
                    vm.subResearchEntity = subResearchEntity;
                });
        }

        function editUserProfile() {
            ModalService.openProfileForm();
        }

        function showWizardVisible() {
            return vm.subResearchEntity.getType() === 'user';
        }

        function openWizard() {
            ModalService.openWizard([
                'welcome',
                'scopus-edit',
                'tutorial',
                'admin-tutorial',
            ], {
                isClosable: true,
                size: 'lg'
            });
        }

        function openSuggestedWizard() {
            ModalService.openWizard(['alias-edit'], {
                isClosable: true,
                size: 'lg'
            });
        }

        function getUrl(url) {
            if (subResearchEntity.getType() === 'group') {
                return prefix + subResearchEntity.slug + '/' + url;
            }

            return prefix + url;
        }
    }
})();