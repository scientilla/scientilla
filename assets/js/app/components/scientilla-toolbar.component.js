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
        vm.editProfile = editProfile;
        vm.showWizardVisible = showWizardVisible;
        vm.openWizard = openWizard;
        vm.openSuggestedWizard = openSuggestedWizard;
        vm.originalUser = {};

        vm.$onInit = function () {

            EventsService.subscribeAll(vm, [
                EventsService.AUTH_LOGIN,
                EventsService.AUTH_LOGOUT,
                EventsService.CONTEXT_CHANGE
            ], refresh);

            refresh();

            vm.originalUser = angular.copy(vm.user);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

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
                    path.goTo('/' + group.slug);
                });
        }

        function changeContextToUser(user) {
            return UsersService.getProfile(user.id)
                .then(user => {
                    context.setSubResearchEntity(user);
                })
                .then(() => {
                    path.goTo('/');
                });
        }

        function editProfile() {
            let openForm;
            let researchEntityService;
            if (vm.subResearchEntity.getType() === 'user') {
                openForm = ModalService.openScientillaUserForm;
                researchEntityService = UsersService;
            }
            else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }

            researchEntityService
                .getProfile(vm.subResearchEntity.id)
                .then(openForm)
                .then(function (status) {
                    if (status !== 1)
                        return vm.subResearchEntity;
                    return researchEntityService.getProfile(vm.subResearchEntity.id);
                })
                .then(function (subResearchEntity) {
                    vm.subResearchEntity = subResearchEntity;
                });
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
    }
})();