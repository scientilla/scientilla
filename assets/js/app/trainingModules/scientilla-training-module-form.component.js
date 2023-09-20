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
        'Restangular',
        '$scope',
        '$timeout',
        'context',
        'FormStatus',
        'trainingModuleService',
        'trainingModuleTypes',
        'trainingModuleSoftSkillsResearchDomain',
        'GroupsService',
        'UsersService',
        'groupTypes',
        'PhdThesisService',
        'userConstants'
    ];

    function controller(
        Restangular,
        $scope,
        $timeout,
        context,
        FormStatus,
        trainingModuleService,
        trainingModuleTypes,
        trainingModuleSoftSkillsResearchDomain,
        GroupsService,
        UsersService,
        groupTypes,
        PhdThesisService,
        userConstants
    ) {
        const vm = this;

        vm.formStatus = new FormStatus('draft');

        vm.unsavedData = false;
        vm.errors = {};
        vm.errorText = '';
        vm.mode = 'draft';

        vm.cancel = close;
        vm.verify = verify;
        vm.save = save;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;
        vm.getCourses = getCourses;
        vm.getUsers = getUsers;
        vm.getNextYear = trainingModuleService.getNextYear;
        vm.researchDomains = [];
        vm.trainingModuleResearchDomains = [];
        vm.softSkillsCheckbox = false;
        vm.deliveryIsBeenSet = false;
        vm.moduleTypes = trainingModuleTypes;
        const otherOption = 'Other';

        let fieldTimeout;
        const fieldDelay = 500;

        let watchers = [];

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.trainingModule = _.cloneDeep(vm.trainingModule);
            if (!_.isNil(vm.trainingModule.year)) {
                vm.trainingModule.year = parseInt(vm.trainingModule.year);
            }
            vm.researchEntity = await context.getResearchEntity();
            vm.researchDomains = await GroupsService.getGroups({type: groupTypes.RESEARCH_DOMAIN, active: true});
            vm.centers = await GroupsService.getGroups({type: groupTypes.CENTER, active: true});
            vm.centers.push({name: otherOption});
            vm.centers = _.orderBy(vm.centers, 'name');
            vm.otherOption = otherOption;
            vm.institutes = await PhdThesisService.getInstitutes();

            if (_.has(vm.trainingModule.institute, 'id')) {
                vm.trainingModule.institute = vm.trainingModule.institute.id;
            }

            if (_.has(vm.trainingModule.phdCourse, 'id')) {
                vm.trainingModule.phdCourse = vm.trainingModule.phdCourse.id;
            }

            if (_.has(vm.trainingModule, 'wholeModule')) {
                if (vm.trainingModule.wholeModule) {
                    vm.moduleType = trainingModuleTypes.WHOLE_MODULE;
                } else {
                    vm.moduleType = trainingModuleTypes.GENERAL_MODULE;
                }
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

            setDeliveryCheckboxes();
            setResearchDomainCheckboxes();

            const deliveryOnLineWatcher = $scope.$watch('vm.deliveryOnLine', setTrainingModuleDelivery);
            const deliveryInPresenceWatcher = $scope.$watch('vm.deliveryInPresence', setTrainingModuleDelivery);
            const instituteWatcher = $scope.$watch('vm.trainingModule.institute', async () => {
                vm.courses = await PhdThesisService.getCourses({id: vm.trainingModule.institute});
            });
            const otherCourseWatcher = $scope.$watch('vm.trainingModule.otherCourse', newValue => {
                if (newValue) {
                    vm.trainingModule.institute = null;
                    vm.trainingModule.phdCourse = null;
                }
            });

            if (_.has(vm.trainingModule.referent, 'id')) {
                vm.selectedReferent = await UsersService.getUser(vm.trainingModule.referent.id);
            }

            if (_.has(vm.trainingModule, 'location')) {
                if (vm.centers.find(c => c.name === vm.trainingModule.location)) {
                    vm.location = vm.trainingModule.location;
                } else {
                    vm.location = otherOption;
                    vm.otherLocation = vm.trainingModule.location;
                }
            }

            if (_.isNil(vm.trainingModule.otherCourse)) {
                vm.trainingModule.otherCourse = false;
            }

            watchers.push(resetFormInteractionWatcher);
            watchers.push(formPristineWatcher);
            watchers.push(selectedReferentWatcher);
            watchers.push(deliveryOnLineWatcher);
            watchers.push(deliveryInPresenceWatcher);
            watchers.push(instituteWatcher);
            watchers.push(otherCourseWatcher);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            for (const watcher in watchers) {
                if (_.isFunction(watcher)) {
                    watcher();
                }
            }
        };

        vm.isLocationSelectDisabled = () => {
            return !_.isUndefined(vm.location) && vm.location !== otherOption;
        };

        function checkValidation(field = false) {
            if (field) {
                vm.errors[field] = trainingModuleService.validate(vm.trainingModule, field);

                if (!vm.errors[field]) {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = trainingModuleService.validate(vm.trainingModule);
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
            vm.mode = 'draft';
            return processSave(true);
        }

        /* jshint ignore:start */
        async function getUsers(term) {
            return await UsersService.search(term, [
                userConstants.role.USER,
                userConstants.role.SUPERUSER,
                userConstants.role.ADMINISTRATOR
            ]);
        }
        /* jshint ignore:end */

        function setTrainingModuleDelivery() {
            switch (true) {
                case vm.deliveryOnLine && vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.ON_LINE_IN_PRESENCE;
                    vm.deliveryIsBeenSet = true;
                    break;
                case vm.deliveryOnLine && !vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.ON_LINE;
                    vm.deliveryIsBeenSet = true;
                    break;
                case !vm.deliveryOnLine && vm.deliveryInPresence:
                    vm.trainingModule.delivery = trainingModuleDeliveryOptions.IN_PRESENCE;
                    vm.deliveryIsBeenSet = true;
                    break;
                default:
                    vm.trainingModule.delivery = null;
                    break;
            }

            if (vm.deliveryIsBeenSet) {
                vm.checkValidation('delivery');
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
                    vm.deliveryOnLine = false;
                    vm.deliveryInPresence = false;
                    break;
            }
        }

        function setResearchDomainCheckboxes() {
            // Skip if is no array
            if (!_.isArray(vm.trainingModule.researchDomains)) {
                return;
            }

            for (const researchDomain of vm.researchDomains) {
                vm.trainingModuleResearchDomains[researchDomain.name] = vm.trainingModule.researchDomains.includes(researchDomain.name);
            }

            vm.softSkillsCheckbox = vm.trainingModule.researchDomains.includes(trainingModuleSoftSkillsResearchDomain);
        }

        vm.onChangeResearchDomain = () => {
            const trainingModuleResearchDomains = [];

            for (const researchDomain of vm.researchDomains) {
                if (vm.trainingModuleResearchDomains[researchDomain.name]) {
                    trainingModuleResearchDomains.push(researchDomain.name);
                }
            }

            if (vm.softSkillsCheckbox) {
                trainingModuleResearchDomains.push(trainingModuleSoftSkillsResearchDomain);
            }

            vm.trainingModule.researchDomains = trainingModuleResearchDomains;
            vm.checkValidation('researchDomains');
        };

        vm.onChangeOtherLocation = () => {
            vm.location = otherOption;
            vm.trainingModule.location = vm.otherLocation;
            vm.fieldValueHasChanged('location');
        };

        vm.onChangeLocation = () => {
            if (vm.location === otherOption) {
                vm.trainingModule.location = vm.otherLocation;
            } else {
                vm.trainingModule.location = vm.location;
            }
            vm.fieldValueHasChanged('location');
        };

        vm.onModuleTypeChange = () => {
            if (vm.moduleType === trainingModuleTypes.WHOLE_MODULE) {
                vm.trainingModule.wholeModule = true;
            } else {
                vm.trainingModule.wholeModule = false;
            }
            checkValidation('generalModuleTitle');
        };

        vm.isGeneralModule = () => {
            return _.has(vm.trainingModule, 'wholeModule') && !vm.trainingModule.wholeModule;
        };

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
            vm.mode = 'verify';
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
            return Restangular.all('courses').getList(qs);
        }

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => !vm.unsavedData);
            }
        }
    }
})();
