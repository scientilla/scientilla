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
        '$rootScope'
    ];

    function scientillaToolbar(EventsService,
                               AuthService,
                               Settings,
                               context,
                               GroupsService,
                               UsersService,
                               ModalService,
                               path,
                               $rootScope) {
        const vm = this;
        vm.wizardOpened = false;
        vm.isRegisterEnabled = false;
        vm.changeContextToGroup = changeContextToGroup;
        vm.changeContextToUser = changeContextToUser;
        vm.editProfile = editProfile;
        vm.showWizardVisible = showWizardVisible;
        vm.openWizard = openWizard;
        vm.openSuggestedWizard = openSuggestedWizard;
        vm.toggleMobileMenu = toggleMobileMenu;

        vm.$onInit = function () {

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

        function refresh() {
            vm.isLogged = AuthService.isLogged;
            vm.user = AuthService.user;
            Settings.getSettings()
                .then(function (settings) {
                    vm.isRegisterEnabled = settings.registerEnabled;
                });
            vm.researchEntity = context.getResearchEntity();
        }

        function changeContextToGroup(group) {
            return GroupsService.getGroup(group.id)
                .then(group => context.setResearchEntity(group))
                .then(() => redirectToHomepage());
        }

        function changeContextToUser(user) {
            return UsersService.getProfile(user.id)
                .then(user => context.setResearchEntity(user))
                .then(() => redirectToHomepage());
        }

        function redirectToHomepage() {
            //TODO: should become dynamic
            const researchEntityHompeage = '/';
            path.goTo(researchEntityHompeage);
        }

        function editProfile() {
            let openForm;
            let researchEntityService;
            if (vm.researchEntity.getType() === 'user') {
                openForm = ModalService.openScientillaUserForm;
                researchEntityService = UsersService;
            }
            else {
                openForm = ModalService.openScientillaGroupForm;
                researchEntityService = GroupsService;
            }

            researchEntityService
                .getProfile(vm.researchEntity.id)
                .then(openForm)
                .then(function (status) {
                    if (status !== 1)
                        return vm.researchEntity;
                    return researchEntityService.getProfile(vm.researchEntity.id);
                })
                .then(function (researchEntity) {
                    vm.researchEntity = researchEntity;
                });

            $rootScope.$emit('toggleMobileMenu');
        }

        function showWizardVisible() {
            return vm.researchEntity.getType() === 'user';
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

            $rootScope.$emit('toggleMobileMenu');
        }

        function openSuggestedWizard() {
            ModalService.openWizard(['alias-edit'], {
                isClosable: true,
                size: 'lg'
            });

            $rootScope.$emit('toggleMobileMenu');
        }

        function toggleMobileMenu() {
            $rootScope.$emit('toggleMobileMenu');
        }
    }

})();