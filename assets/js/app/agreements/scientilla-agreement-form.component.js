/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaAgreementForm', {
            templateUrl: 'partials/scientilla-agreement-form.html',
            controller: scientillaAgreementFormController,
            controllerAs: 'vm',
            bindings: {
                agreement: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    scientillaAgreementFormController.$inject = [
        '$scope',
        '$timeout',
        'context',
        'ProjectService',
        'agreementTypes',
        'agreementRequiredFields',
        'agreementFieldRules',
        'agreementFields',
        'FormStatus',
        'ValidateService'
    ];

    function scientillaAgreementFormController(
        $scope,
        $timeout,
        context,
        ProjectService,
        agreementTypes,
        agreementRequiredFields,
        agreementFieldRules,
        agreementFields,
        FormStatus,
        ValidateService
    ) {
        const vm = this;

        vm.formStatus = new FormStatus('draft');

        vm.unsavedData = false;
        vm.errors = {};
        vm.errorText = '';

        vm.cancel = close;
        vm.verify = verify;
        vm.save = save;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        vm.datePickerOptions = {
            showWeeks: false
        };

        vm.agreementTypes = agreementTypes;

        let fieldTimeout;
        const fieldDelay = 500;

        let watchers = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            if (_.has(vm.agreement, 'projectData')) {
                vm.agreementData = vm.agreement.projectData;
                if (_.has(vm.agreement.projectData, 'startDate') && vm.agreementData.startDate !== null) {
                    vm.agreementData.startDate = new Date(vm.agreement.projectData.startDate);
                } else {
                    vm.agreementData.startDate = null;
                }
                if (_.has(vm.agreement.projectData, 'endDate') && vm.agreementData.endDate !== null) {
                    vm.agreementData.endDate = new Date(vm.agreement.projectData.endDate);
                } else {
                    vm.agreementData.endDate = null;
                }
            } else {
                vm.agreementData = {
                    pis: [],
                    partners: [],
                    piStr: null,
                    startDate: null,
                    endDate: null
                };
            }

            // Listen to the form reset to trigger $setPristine
            const resetFormInteractionWatcher = $scope.$watch('vm.formStatus.resetFormInteraction', function () {
                if (vm.formStatus.resetFormInteraction) {
                    vm.formStatus.resetFormInteraction = false;

                    // Reset the user interaction with the form
                    $scope.form.$setPristine();
                }
            });

            const formPristineWatcher = $scope.$watch('form.$pristine', formUntouched => vm.unsavedData = !formUntouched);

            watchers.push(resetFormInteractionWatcher);
            watchers.push(formPristineWatcher);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            for (const watcher in watchers) {
                if (_.isFunction(watcher)) {
                    watcher();
                }
            }
        };

        function checkValidation(field = false) {
            if (field) {
                vm.errors[field] = ValidateService.validate(vm.agreementData, field, agreementRequiredFields, agreementFieldRules);

                if (!vm.errors[field]) {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = ValidateService.validate(vm.agreementData, false, agreementRequiredFields, agreementFieldRules);
            }

            vm.errorText = !_.isEmpty(vm.errors) ? 'Please fix the warnings before verifying!' : '';
        }

        function fieldValueHasChanged(field = false) {
            $timeout.cancel(fieldTimeout);

            fieldTimeout = $timeout(() => checkValidation(field), fieldDelay);
        }

        function save() {
            vm.errors = {};
            vm.errorText = '';
            return processSave(true);
        }

        /* jshint ignore:start */
        async function processSave(updateState = false) {
            if (updateState) {
                vm.formStatus.setSaveStatus('saving');
            }

            vm.errorText = '';
            vm.errors = ValidateService.validate(vm.agreementData, false, agreementRequiredFields, agreementFieldRules);

            setAgreement();

            if (!_.isEmpty(vm.errors)) {
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
            }

            const filteredAgreement = ProjectService.filterFields(vm.agreement, agreementFields);

            if (vm.agreement.id) {
                filteredAgreement.id = vm.agreement.id;
                await ProjectService.update(vm.researchEntity, filteredAgreement);
            } else {
                const draft = await ProjectService.create(vm.researchEntity, filteredAgreement);
                if (draft && draft.researchItem && draft.researchItem.id) {
                    vm.agreement.id = draft.researchItem.id;
                }
            }

            if (updateState) {
                vm.formStatus.setSaveStatus('saved');
                $timeout(() => vm.formStatus.setSaveStatus('ready to save'), 1000);
            }

            vm.unsavedData = false;
        }

        async function verify() {
            vm.errorText = '';
            vm.errors = {};
            vm.formStatus.setVerifyStatus('verifying');

            $timeout(async function () {
                vm.errors = await ValidateService.validate(vm.agreementData, false, agreementRequiredFields, agreementFieldRules);

                setAgreement();

                if (_.isEmpty(vm.errors)) {
                    // Is valid
                    await processSave();
                    vm.formStatus.setVerifyStatus('verified');
                    await vm.closeFn()();
                    ProjectService.verify(vm.researchEntity, vm.agreement);
                } else {
                    // Is not valid
                    vm.formStatus.setVerifyStatus('failed');
                    vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                    await processSave(false);

                    $timeout(() => vm.formStatus.setVerifyStatus('ready to verify'), 1000);
                }
            }, 200);
        }
        /* jshint ignore:end */

        function setAgreement() {
            vm.agreement.piStr = vm.agreementData.piStr;
            vm.agreement.startYear = vm.agreementData.startDate ? vm.agreementData.startDate.getFullYear() : null;
            vm.agreement.endYear = vm.agreementData.endDate ? vm.agreementData.endDate.getFullYear() : null;
            vm.agreement.type = 'project_agreement';
            vm.agreement.projectData = angular.copy(vm.agreementData);
        }

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => !vm.unsavedData);
            }
        }
    }
})();