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
        'agreementTypes'
    ];

    function scientillaAgreementFormController(
        $scope,
        $timeout,
        context,
        ProjectService,
        agreementTypes
    ) {
        const vm = this;

        vm.unsavedData = false;

        vm.cancel = close;
        vm.verify = verify;
        vm.save = save;

        vm.saveStatus = {
            state: 'ready to save',
            message: 'Save draft'
        };

        vm.verifyStatus = {
            state: 'ready to verify',
            message: 'Save & verify'
        };

        vm.datePickerOptions = {
            showWeeks: false
        };

        vm.agreementTypes = agreementTypes;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            if (_.has(vm.agreement, 'projectData')) {
                vm.agreementData = vm.agreement.projectData;
                vm.agreementData.startDate = new Date(vm.agreement.projectData.startDate);
                vm.agreementData.endDate = new Date(vm.agreement.projectData.endDate);
            } else vm.agreementData = {
                pis: [],
                partners: []
            };

            $scope.$watch('form.$pristine', formUntouched => vm.unsavedData = !formUntouched);
        };

        function save() {
            vm.errors = {};
            vm.errorText = '';
            return processSave(true);
        }

        /* jshint ignore:start */
        async function processSave(updateState = false) {
            //if (updateState)
            //    vm.saveStatus.setState('saving');

            vm.errorText = '';
            //vm.errors = ProjectService.validate(vm.agreement);

            setAgreement();


            if (!_.isEmpty(vm.errors))
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';

            const filteredAgreement = ProjectService.filterFields(vm.agreement);

            if (vm.agreement.id) {
                filteredAgreement.id = vm.agreement.id;
                await ProjectService.update(vm.researchEntity, filteredAgreement);
            } else {
                const draft = await ProjectService.create(vm.researchEntity, filteredAgreement);
                vm.agreement.id = draft.researchItem.id;
            }

            //if (updateState) {
            //    vm.saveStatus.setState('saved');
            //    $timeout(() => vm.saveStatus.setState('ready to save'), 1000);
            //}

            vm.unsavedData = false;
        }

        async function verify() {
            vm.errorText = '';
            vm.errors = {};
            //vm.verifyStatus.setState('verifying');

            $timeout(async function () {
                setAgreement();
                vm.errors = await ProjectService.validate(vm.agreement);

                if (Object.keys(vm.errors).length === 0) {
                    // Is valid
                    await processSave();
                    //vm.verifyStatus.setState('verified');
                    await vm.closeFn()();
                    ProjectService.verify(vm.researchEntity, vm.agreement);
                } else {
                    // Is not valid
                    //vm.verifyStatus.setState('failed');
                    vm.errorText = 'The draft has been saved but not been verified! Please correct the errors on this form!';

                    await processSave(false);

                    $timeout(function () {
                        //vm.verifyStatus.setState('ready to verify');
                    }, 1000);
                }
            }, 200);
        }

        function setAgreement() {
            vm.agreement.piStr = vm.agreementData.piStr;
            vm.agreement.startYear = vm.agreementData.startDate ? vm.agreementData.startDate.getFullYear() : null;
            vm.agreement.endYear = vm.agreementData.endDate ? vm.agreementData.endDate.getFullYear() : null;
            vm.agreement.type = 'project_agreement';
            vm.agreement.projectData = vm.agreementData;
        }

        function close() {
            if (_.isFunction(vm.checkAndClose()))
                vm.checkAndClose()(() => !vm.unsavedData);
        }

        /* jshint ignore:end */
    }
})();