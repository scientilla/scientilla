/* global angular */
(function () {
    "use strict";

    angular
        .module('trainingModules')
        .component('scientillaTrainingModuleForm', {
            templateUrl: 'partials/scientilla-training-module-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                trainingModule: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    controller.$inject = [
        '$scope',
        '$timeout',
        'context',
        'FormStatus',
        'ValidateService',
        'EventsService',
        'trainingModuleService',
        'trainingModuleType',
        'trainingModuleRequiredFields',
        'trainingModuleFieldsRules',
        'GroupsService',
        'UsersService'
    ];

    function controller(
        $scope,
        $timeout,
        context,
        // ProjectService,
        // agreementTypes,
        // agreementRequiredFields,
        // agreementFieldRules,
        // agreementFields,
        FormStatus,
        ValidateService,
        EventsService,
        trainingModuleService,
        trainingModuleType,
        trainingModuleRequiredFields,
        trainingModuleFieldsRules,
        GroupsService,
        UsersService
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
        vm.getCourses = getCourses;
        vm.getUsers = getUsers;
        vm.trainingModule.type = trainingModuleType;
        vm.researchDomains = [];

        let fieldTimeout;
        const fieldDelay = 500;

        let watchers = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            const researchDomains = await GroupsService.getGroups({type: 'Research Domain'});
            vm.researchDomains = [];
            for (const researchDomain of researchDomains) {
                vm.researchDomains.push(researchDomain.name);
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

            const selectedReferentWatcher = $scope.$watch('vm.selectedReferent', (newValue, oldValue) => {
                if (newValue) {
                    vm.trainingModule.referent = newValue.id;
                }
            });

            const deliveryOnLineWatcher = $scope.$watch('vm.deliveryOnLine', setTrainingModuleDelivery);
            const deliveryInPresenceWatcher = $scope.$watch('vm.deliveryInPresence', setTrainingModuleDelivery);

            if (vm.trainingModule.referent) {
                vm.selectedReferent = await UsersService.getUser(vm.trainingModule.referent);
            }

            setDeliveryCheckboxes();

            watchers.push(resetFormInteractionWatcher);
            watchers.push(formPristineWatcher);
            watchers.push(selectedReferentWatcher);
            watchers.push(deliveryOnLineWatcher);
            watchers.push(deliveryInPresenceWatcher);
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
                vm.errors[field] = ValidateService.validate(vm.trainingModule, field, trainingModuleRequiredFields, trainingModuleFieldsRules);

                if (!vm.errors[field]) {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = ValidateService.validate(vm.trainingModule, false, trainingModuleRequiredFields, trainingModuleFieldsRules);
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

        function getUsers(searchText) {
            const qs = {where: {or: [
                {name: {contains: searchText}},
                {surname: {contains: searchText}},
                {displayName: {contains: searchText}},
                {displaySurname: {contains: searchText}}
            ]}};
            return UsersService.getUsers(qs);
        }

        function setTrainingModuleDelivery() {
            switch (true) {
                case vm.deliveryOnLine && vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.ON_LINE_IN_PRESENCE;
                    break;
                case vm.deliveryOnLine && !vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.ON_LINE;
                    break;
                case !vm.deliveryOnLine && vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.IN_PRESENCE;
                    break;
                default:
                    break;
            }
        }

        function setDeliveryCheckboxes() {
            switch (vm.trainingModule.delivery) {
                case trainingModuleDeliveryOptions.ON_LINE_IN_PRESENCE:
                    vm.deliveryOnLine = true;
                    vm.deliveryInPresence = true;
                    break;
                case trainingModuleDeliveryOptions.ON_LINE:
                    vm.deliveryOnLine = true;
                    vm.deliveryInPresence = false;
                    break;
                case trainingModuleDeliveryOptions.IN_PRESENCE:
                    vm.deliveryOnLine = false;
                    vm.deliveryInPresence = true;
                    break;
                default:
                    break;
            }
        }

        /* jshint ignore:start */
        async function processSave(updateState = false) {
            if (updateState) {
                vm.formStatus.setSaveStatus('saving');
            }

            vm.errorText = '';
            vm.errors = trainingModuleService.validate(vm.trainingModule);

            if (!_.isEmpty(vm.errors)) {
                vm.errorText = 'The draft has been saved but please fix the warnings before verifying!';
            }

            const filteredTrainingModule = trainingModuleService.filterFields(vm.trainingModule);

            if (filteredTrainingModule.id) {
                await trainingModuleService.update(vm.researchEntity, filteredTrainingModule);
            } else {
                const draft = await trainingModuleService.create(vm.researchEntity, filteredTrainingModule);
                vm.trainingModule.id = draft.researchItem.id;
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
                vm.errors = trainingModuleService.validate(vm.trainingModule);

                if (_.isEmpty(vm.errors)) {
                    // Is valid
                    await processSave();
                    vm.formStatus.setVerifyStatus('verified');
                    await vm.closeFn()();
                    await trainingModuleService.verify(vm.researchEntity, vm.trainingModule);
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

        function getCourses(searchText) {
            const qs = {where: {title: {contains: searchText}}};
            return [];
            //return Restangular.all('courses').getList(qs);
        }

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => !vm.unsavedData);
            }
        }
    }
})();
