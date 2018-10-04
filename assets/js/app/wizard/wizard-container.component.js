(function () {
    'use strict';

    angular.module('wizard')
        .component('wizardContainer', {
            templateUrl: 'partials/wizard-container.html',
            class: 'wizard-modal',
            controller: wizardContainer,
            controllerAs: 'vm',
            bindings: {
                resolve: '<'
            }
        });

    wizardContainer.$inject = [
        'context',
        'ModalService'
    ];

    function wizardContainer(context, ModalService) {
        const vm = this;

        vm.currentStep = 0;
        vm.researchEntity = context.getResearchEntity();

        vm.isStep = isStep;
        vm.closeModal = closeModal;
        vm.setStep = setStep;
        vm.checkStep = checkStep;
        vm.isNotPrev = isNotPrev;
        vm.isEnd = isEnd;
        vm.getStepsNumber = getStepsNumber;
        vm.wizardCommands = wizardCommands;

        const accessLevels = {
            GROUP_ADMIN: 'groupAdmin',
            STANDARD: 'standard'
        };

        var originalResearchEntity = Object.assign({}, vm.researchEntity);

        const allSteps = [
            {
                name: 'welcome',
                component: 'wizard-welcome',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: false
            },
            {
                name: 'scopus-edit',
                component: 'wizard-scopus-edit',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: false
            },
            {
                name: 'tutorial',
                component: 'wizard-tutorial',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: true
            },
            {
                name: 'admin-tutorial',
                component: 'wizard-admin-tutorial',
                accessLevels: [accessLevels.GROUP_ADMIN],
                researchEntityToSave: true
            },
            {
                name: 'alias-edit',
                component: 'wizard-alias-edit',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: true
            },
            {
                name: 'summary-metrics',
                component: 'wizard-summary-metrics',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: false
            },
            {
                name: 'summary-overview',
                component: 'wizard-summary-overview',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                researchEntityToSave: false
            }
        ];

        let steps = [];
        vm.formHasUnsavedData = false;

        vm.$onInit = function () {
            vm.currentStep = 0;
            const accessLevel = vm.researchEntity.getType() === 'group' ? accessLevels.GROUP_ADMIN :
                vm.researchEntity.administratedGroups.length ? accessLevels.GROUP_ADMIN : accessLevels.STANDARD;
            steps = allSteps.filter(s => s.accessLevels.includes(accessLevel));
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
            if (!steps[vm.currentStep].researchEntityToSave) {
                vm.resolve.callbacks.onClose();
                return;
            }

            vm.researchEntity.alreadyAccess = true;
            if (vm.resolve.data.steps.includes('alias-edit'))
                vm.researchEntity.alreadyOpenedSuggested = true;

            return vm.researchEntity.save()
                .then(() => vm.resolve.callbacks.onClose())
                .catch(() => Notification.warning("Failed to save user"));
        }

        function setStep(step) {
            switch(true) {
                case step === 'next':
                    vm.currentStep += (vm.currentStep < steps.length ? 1 : 0);
                    break;
                case step === 'previous':
                    vm.currentStep -= (vm.currentStep > 0 ? 1 : 0);
                    break;
            }
        }

        function checkStep(step) {
            if (vm.formHasUnsavedData) {
                ModalService
                    .multipleChoiceConfirm('Unsaved data',
                        `Do you want to save this data?`,
                        ['Yes', 'No'],
                        false)
                    .then(function (buttonIndex) {
                        switch(buttonIndex) {
                            case 0:
                                vm.researchEntity.save();
                                originalResearchEntity = Object.assign({}, vm.researchEntity);
                                break;
                            case 1:
                                vm.researchEntity = Object.assign({}, originalResearchEntity);
                                break;
                        }

                        vm.formHasUnsavedData = false;

                        setStep(step);
                    });
            } else {
                setStep(step);
            }
        }

        function isNotPrev() {
            return vm.currentStep === 0;
        }

        function isEnd() {
            return vm.currentStep === (steps.length - 1);
        }

        function getStepsNumber(){
            return steps.length;
        }

        function wizardCommands(command) {
            if (command === 'formSaved') {
                vm.formHasUnsavedData = false;
            }

            if (command === 'formUnsaved') {
                vm.formHasUnsavedData = true;
            }
        }
    }
})();