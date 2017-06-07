(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardContainer', {
            templateUrl: 'partials/wizard-container.html',
            controller: wizardContainer,
            controllerAs: 'vm',
            bindings: {
                resolve: '<'
            }
        });

    wizardContainer.$inject = [
        'AuthService',
        'UsersService'
    ];

    function wizardContainer(AuthService, UsersService) {
        const vm = this;

        vm.currentStep = 0;
        vm.user = {};

        vm.isStep = isStep;
        vm.closeModal = closeModal;
        vm.nextStep = nextStep;
        vm.prevStep = prevStep;
        vm.isNotPrev = isNotPrev;
        vm.isEnd = isEnd;
        vm.wizardCommands = wizardCommands;

        const allSteps = [
            {
                name: 'welcome',
                component: 'wizard-welcome',
                userLevels: ['groupAdmin', 'standard']
            },
            {
                name: 'edit',
                component: 'wizard-edit',
                userLevels: ['groupAdmin', 'standard']
            },
            {
                name: 'tutorial',
                component: 'wizard-tutorial',
                userLevels: ['groupAdmin', 'standard']
            },
            {
                name: 'admin-tutorial',
                component: 'wizard-admin-tutorial',
                userLevels: ['groupAdmin']
            }
        ];

        let steps = [];
        vm.canChangeStep = true;

        vm.$onInit = function () {
            vm.user = AuthService.user;
            vm.currentStep = 0;
            vm.userLevel = vm.user.administratedGroups.length ? 'groupAdmin' : 'standard';
            steps = allSteps.filter(s => s.userLevels.includes(vm.userLevel));
        };

        vm.$onDestroy = function () {
        };

        function isStep(stepName) {
            return steps[vm.currentStep].name === stepName;
        }

        function closeModal() {
            vm.user.alreadyAccess = true;

            UsersService
                .doSave(vm.user)
                .catch(function () {
                    Notification.warning("Failed to save user");
                });

            vm.resolve.callbacks.onClose();
        }

        function nextStep() {
            vm.currentStep += (vm.currentStep < steps.length ? 1 : 0);
        }

        function prevStep() {
            vm.currentStep -= (vm.currentStep > 0 ? 1 : 0);
        }

        function isNotPrev() {
            return vm.currentStep === 0;
        }

        function isEnd() {
            return vm.currentStep === (steps.length - 1);
        }

        function wizardCommands(command) {
            if (command === 'stop')
                vm.canChangeStep = false;
            if (command === 'continue')
                vm.canChangeStep = true;
        }

    }
})();