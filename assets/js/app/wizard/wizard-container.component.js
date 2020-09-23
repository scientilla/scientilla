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
        'UsersService'
    ];

    function wizardContainer(context, Notification, ModalService, $scope, UsersService) {
        const vm = this;

        vm.currentStep = 0;

        vm.originalSubResearchEntity = context.getSubResearchEntity();
        vm.subResearchEntity = angular.copy(vm.originalSubResearchEntity);

        vm.isStep = isStep;
        vm.closeModal = closeModal;
        vm.close = close;
        vm.setStep = setStep;
        vm.checkStep = checkStep;
        vm.isNotPrev = isNotPrev;
        vm.isEnd = isEnd;
        vm.getStepsNumber = getStepsNumber;
        vm.chooseType = chooseType;

        const accessLevels = {
            GROUP_ADMIN: 'groupAdmin',
            STANDARD: 'standard'
        };

        const fields = [
            'orcidId',
            'scopusId',
            'config'
        ];

        const allSteps = [
            {
                name: 'new-features',
                component: 'wizard-new-features',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: false
            },
            {
                name: 'select-scientific-production',
                component: 'wizard-select-scientific-production',
                accessLevels: [accessLevels.GROUP_ADMIN, accessLevels.STANDARD],
                subResearchEntityToSave: false
            },
            {
                name: 'scientific-production',
                component: 'wizard-scientific-production',
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

            $scope.$on('modal.closing', function (event, reason) {
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

            updateUserData();
            return UsersService.save(vm.subResearchEntity)
                .then(() => vm.resolve.callbacks.onClose())
                .catch(() => Notification.warning("Failed to save user"));
        }

        function setStep(step) {
            switch (true) {
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
                        .multipleChoiceConfirm('Unsaved data!',
                            '',
                            {'continue': 'Continue editing', 'discard': 'Discard changes'},
                            false)
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 'continue':
                                    break;
                                case 'discard':
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

        function getStepsNumber() {
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
                            .multipleChoiceConfirm('Unsaved data!',
                                ``,
                                {'continue': 'Continue editing', 'discard': 'Discard changes'},
                                false)
                            .then(function (buttonIndex) {
                                switch (buttonIndex) {
                                    case 'continue':
                                        break;
                                    case 'discard':
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

        function updateUserData() {
            const subResearchEntity = context.getSubResearchEntity();
            for (const key of fields) {
                subResearchEntity[key] = vm.subResearchEntity[key];
            }
        }

        function chooseType(type) {
            vm.subResearchEntity.config.scientific = type;

            if (type) {
                updateUserData();
                UsersService.save(vm.subResearchEntity)
                    .then(() => {
                        vm.subResearchEntity = angular.copy(vm.originalSubResearchEntity);
                        setStep('next');
                    });
            } else {
                vm.subResearchEntity.alreadyAccess = true;
                updateUserData();
                UsersService.save(vm.subResearchEntity)
                    .then(() => {
                        vm.resolve.callbacks.onClose();
                    });
            }
        }
    }
})();