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
        '$scope',
    ];

    function wizardContainer(context, Notification, ModalService, $scope) {
        const vm = this;

        vm.currentStep = 0;
        vm.subResearchEntity = context.getSubResearchEntity();
        vm.originalSubResearchEntity = angular.copy(vm.subResearchEntity);

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
                subResearchEntityToSave: false
            },
            {
                name: 'scopus-edit',
                component: 'wizard-scopus-edit',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: false
            },
            {
                name: 'tutorial',
                component: 'wizard-tutorial',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: true
            },
            {
                name: 'admin-tutorial',
                component: 'wizard-admin-tutorial',
                accessLevels: [accessLevels.GROUP_ADMIN],
                subResearchEntityToSave: true
            },
            {
                name: 'alias-edit',
                component: 'wizard-alias-edit',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: true
            },
            {
                name: 'summary-metrics',
                component: 'wizard-summary-metrics',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: false
            },
            {
                name: 'summary-overview',
                component: 'wizard-summary-overview',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: false
            }
        ];

        let steps = [];
        let closed = false;

        vm.$onInit = function () {

            vm.currentStep = 0;
            const accessLevel = vm.subResearchEntity.getType() === 'group' ? accessLevels.GROUP_ADMIN :
                vm.subResearchEntity.administratedGroups.length ? accessLevels.GROUP_ADMIN : accessLevels.STANDARD;
            steps = allSteps.filter(s => s.accessLevels.includes(accessLevel));
            if (vm.resolve.data.steps)
                steps = steps.filter(s => vm.resolve.data.steps.includes(s.name));

            $scope.$on('modal.closing', function(event, reason) {
                close(event);
            });
        };

        vm.$onDestroy = function () {
        };

        function isStep(stepName) {
            if (!steps[vm.currentStep]) return false;
            return steps[vm.currentStep].name === stepName;
        }

        // You can close the modal once completed the wizard
        function closeModal() {

            if (!steps[vm.currentStep].subResearchEntityToSave) {
                vm.resolve.callbacks.onClose();
                return;
            }

            vm.subResearchEntity.alreadyAccess = true;
            if (vm.resolve.data.steps.includes('alias-edit'))
                vm.subResearchEntity.alreadyOpenedSuggested = true;

            return vm.subResearchEntity.save()
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
            if (steps[vm.currentStep] && steps[vm.currentStep].name === 'scopus-edit') {
                if (angular.toJson(vm.originalSubResearchEntity) === angular.toJson(vm.subResearchEntity)) {
                    setStep(step);
                } else {
                    // Show the unsaved data modal
                    ModalService
                        .multipleChoiceConfirm('Unsaved data',
                            `There is unsaved data in the form. Do you want to go back and save this data?`,
                            ['Yes', 'No'],
                            false)
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 0:
                                    break;
                                case 1:
                                    vm.subResearchEntity = angular.copy(vm.originalSubResearchEntity);
                                    setStep(step);
                                    break;
                                default:
                                    break;
                            }
                        });
                }
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

        function close(event = false) {
            if (!closed) {
                if (steps[vm.currentStep] && steps[vm.currentStep].name === 'alias-edit' ||
                    steps[vm.currentStep] && steps[vm.currentStep].name === 'scopus-edit') {
                    if (angular.toJson(vm.originalSubResearchEntity) !== angular.toJson(vm.subResearchEntity)) {
                        if (event) {
                            event.preventDefault();
                        }

                        // Show the unsaved data modal
                        ModalService
                            .multipleChoiceConfirm('Unsaved data',
                                `There is unsaved data in the form. Do you want to go back and save this data?`,
                                ['Yes', 'No'],
                                false)
                            .then(function (buttonIndex) {
                                switch (buttonIndex) {
                                    case 0:
                                        break;
                                    case 1:
                                        context.setSubResearchEntity(vm.originalSubResearchEntity);
                                        closed = true;
                                        vm.resolve.callbacks.onClose();
                                        break;
                                    default:
                                        break;
                                }
                            });
                    } else {
                        closed = true;
                        if (!event) {
                            vm.resolve.callbacks.onClose();
                        }
                    }
                } else {
                    closed = true;
                    if (!event) {
                        vm.resolve.callbacks.onClose();
                    }
                }
            }
        }
    }
})();