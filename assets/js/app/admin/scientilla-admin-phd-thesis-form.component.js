/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaAdminPhdThesisForm', {
            templateUrl: 'partials/scientilla-admin-phd-thesis-form.html',
            controller: controller,
            controllerAs: 'vm',
            bindings: {
                type: "<",
                action: "<",
                institute: "<",
                course: "<",
                cycle: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    controller.$inject = [
        'Restangular',
        '$scope',
        '$timeout',
        'agreementRequiredFields',
        'agreementFieldRules',
        'ValidateService',
        'phdActions',
        'phdModels',
        'Notification',
        'EventsService',
        'AdminService'
    ];

    function controller(
        Restangular,
        $scope,
        $timeout,
        agreementRequiredFields,
        agreementFieldRules,
        ValidateService,
        phdActions,
        phdModels,
        Notification,
        EventsService,
        AdminService
    ) {
        const vm = this;

        vm.showCycleField = false;
        vm.showCourseField = false;
        vm.showInstituteField = false;

        vm.unsavedData = false;
        vm.errors = {};
        vm.errorText = '';

        vm.cancel = close;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;

        let fieldTimeout;
        const fieldDelay = 500;

        let watchers = [];

        vm.actions = phdActions;
        vm.models = phdModels;

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.showCycleField = false;
            vm.showCourseField = false;
            vm.showInstituteField = false;

            vm.instituteName = '';
            vm.courseName = '';
            vm.cycleName = '';

            switch (vm.type) {
                case vm.models.INSTITUTE:
                    vm.showInstituteField = true;

                    if (vm.action === vm.actions.EDIT) {
                        vm.instituteName = vm.institute.name;
                    }
                    break;
                case vm.models.COURSE:
                    vm.showInstituteField = true;
                    vm.showCourseField = true;

                    if (vm.action === vm.actions.EDIT || vm.action === vm.actions.ADD) {
                        vm.instituteName = vm.institute.name;
                    }

                    if (vm.action === vm.actions.EDIT) {
                        vm.courseName = vm.course.name;
                    }
                    break;
                case vm.models.CYCLE:
                    vm.showInstituteField = true;
                    vm.showCourseField = true;
                    vm.showCycleField = true;

                    if (vm.action === vm.actions.EDIT || vm.action === vm.actions.ADD) {
                        vm.instituteName = vm.institute.name;
                        vm.courseName = vm.course.name;
                    }

                    if (vm.action === vm.actions.EDIT) {
                        vm.cycleName = vm.cycle.name;
                    }
                    break;
                default:
                    break;
            }

            vm.title = `${vm.action} ${vm.type}`;

            const formPristineWatcher = $scope.$watch('form.$pristine', formUntouched => vm.unsavedData = !formUntouched);
            watchers.push(formPristineWatcher);
        };

        vm.save = async () => {
            let result = false;
            let message = false;

            switch (true) {
                case vm.models.INSTITUTE === vm.type && vm.actions.ADD === vm.action:
                    result = await Restangular.one('phdInstitutes').customPOST({
                        name: vm.instituteName
                    });
                    message = 'Institute successfully created!';
                    EventsService.publish(EventsService.PHD_INSTITUTE_CREATED);
                    break;
                case vm.models.INSTITUTE === vm.type && vm.actions.EDIT === vm.action:
                    result = await Restangular.one('phdInstitutes', vm.institute.id).customPUT({
                        name: vm.instituteName
                    });
                    message = 'Institute successfully updated!';
                    EventsService.publish(EventsService.PHD_INSTITUTE_UPDATED);
                    break;
                case vm.models.COURSE === vm.type && vm.actions.ADD === vm.action:
                    result = await Restangular.one('phdCourses').customPOST({
                        institute: vm.institute.id,
                        name: vm.courseName
                    });
                    message = 'Course successfully created!';
                    EventsService.publish(EventsService.PHD_COURSE_CREATED);
                    break;
                case vm.models.COURSE === vm.type && vm.actions.EDIT === vm.action:
                    result = await Restangular.one('phdCourses', vm.course.id).customPUT({
                        name: vm.courseName
                    });
                    message = 'Course successfully updated!';
                    EventsService.publish(EventsService.PHD_COURSE_UPDATED);
                    break;
                case vm.models.CYCLE === vm.type && vm.actions.ADD === vm.action:
                    result = await Restangular.one('phdCycles').customPOST({
                        course: vm.course.id,
                        name: vm.cycleName
                    });
                    message = 'Cycle successfully created!';
                    EventsService.publish(EventsService.PHD_CYCLE_CREATED);
                    break;
                case vm.models.CYCLE === vm.type && vm.actions.EDIT === vm.action:
                    result = await Restangular.one('phdCycles', vm.cycle.id).customPUT({
                        name: vm.cycleName
                    });
                    message = 'Cycle successfully updated!';
                    EventsService.publish(EventsService.PHD_CYCLE_UPDATED);
                    break;
                default:
                    break;
            }

            if (result && message) {
                Notification.success(message);
                resetForm();
                close();
            }
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

        function close() {
            if (_.isFunction(vm.checkAndClose())) {
                vm.checkAndClose()(() => !vm.unsavedData);
            }
        }

        function resetForm() {
            vm.instituteName = '';
            vm.courseName = '';
            vm.cycleName = '';

            vm.unsavedData = false;
            $scope.form.$setPristine();
            $scope.form.$setUntouched();
        }

        vm.getInstitutes = AdminService.getInstitutes;

        vm.getCourses = AdminService.getCourses;

        vm.getCycles = AdminService.getCycles;
    }
})();
