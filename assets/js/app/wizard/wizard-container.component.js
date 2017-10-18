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
        'context'
    ];

    function wizardContainer(context) {
        const vm = this;

        vm.currentStep = 0;
        vm.user = context.getResearchEntity();

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
                name: 'scopus-edit',
                component: 'wizard-scopus-edit',
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
            },
            {
                name: 'alias-edit',
                component: 'wizard-alias-edit',
                userLevels: ['groupAdmin', 'standard']
            }
        ];

        let steps = [];
        vm.canChangeStep = true;

        vm.$onInit = function () {
            vm.currentStep = 0;
            vm.userLevel = vm.user.administratedGroups.length ? 'groupAdmin' : 'standard';
            steps = allSteps.filter(s => s.userLevels.includes(vm.userLevel));
            if (vm.resolve.data.steps)
                steps = steps.filter(s => vm.resolve.data.steps.includes(s.name));
        };

        vm.$onDestroy = function () {
        };

        function isStep(stepName) {
            if (!steps[vm.currentStep]) return false;
            return steps[vm.currentStep].name === stepName;
        }

        function closeModal() {
            vm.user.alreadyAccess = true;
            if (vm.resolve.data.steps.includes('alias-edit'))
                vm.user.alreadyOpenedSuggested = true;

            return vm.user.save()
                .then(()=>vm.resolve.callbacks.onClose())
                .catch(() => Notification.warning("Failed to save user"))
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