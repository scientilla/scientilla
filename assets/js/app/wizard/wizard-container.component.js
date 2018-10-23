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
        'Notification',
        'ModalService',
        '$rootScope',
        '$scope',
        'FormService'
    ];

    function wizardContainer(context, Notification, ModalService, $rootScope, $scope, FormService) {
        const vm = this;

        vm.currentStep = 0;
        vm.researchEntity = context.getResearchEntity();
        vm.originalResearchEntity = angular.copy(vm.researchEntity);

        vm.isStep = isStep;
        vm.closeModal = closeModal;
        vm.close = close;
        vm.setStep = setStep;
        vm.checkStep = checkStep;
        vm.isNotPrev = isNotPrev;
        vm.isEnd = isEnd;
        vm.getStepsNumber = getStepsNumber;

        const accessLevels = {
            GROUP_ADMIN: 'groupAdmin',
            STANDARD: 'standard'
        };

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

        function close() {
            vm.resolve.data.closing();
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
            vm.formHasUnsavedData = FormService.getUnsavedData('scopus-edit');

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
                                vm.originalResearchEntity = angular.copy(vm.researchEntity);
                                Notification.success('Profile saved!');
                                FormService.setUnsavedData('scopus-edit', false);
                                break;
                            case 1:
                                vm.researchEntity = angular.copy(vm.originalResearchEntity);
                                FormService.setUnsavedData('scopus-edit', false);
                                $rootScope.$broadcast('user.scopus.discarded');
                                break;
                            default:
                                break;
                        }

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

        $scope.$on('modal.closing', function(event, reason) {
            if (typeof vm.resolve.data.closing === "function") {
                vm.resolve.data.closing(event, reason);
            }
        });
    }
})();