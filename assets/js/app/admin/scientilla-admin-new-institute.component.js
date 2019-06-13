/* global Scientilla, angular */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaAdminNewInstitute', {
            templateUrl: 'partials/scientilla-admin-new-institute.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                institute: "<",
                onSubmit: "&",
                checkAndClose: "&"
            }
        });

    controller.$inject = [
        '$scope',
        '$timeout',
        'Notification',
        'Restangular',
        'ModalService',
        'EventsService',
        'ValidateService'
    ];

    function controller($scope, $timeout, Notification, Restangular, ModalService, EventsService, ValidateService) {
        const vm = this;

        vm.saveInstitute = saveInstitute;
        vm.cancel = close;
        vm.checkValidation = checkValidation;
        vm.isValid = isValid;
        vm.errors = {};

        let timeout;
        let unsavedData = false;
        let deregisterers = [];

        const delay = 500;

        vm.$onInit = function () {
            if (!vm.institute.id)
                vm.institute = {};

            deregisterers.push($scope.$watch('form.$pristine', formUntouched => unsavedData = !formUntouched));
            deregisterers.push($scope.$watch('vm.institute', fieldValueHasChanged));
        };

        vm.$onDestroy = function () {
            deregisterers.forEach(d => d());
        };

        function isValid() {
            return Object.keys(vm.errors).length === 0;
        }

        function checkErrorMessages(errors) {
            vm.errors = {};

            angular.forEach(errors, function (fields, fieldIndex) {
                angular.forEach(fields, function (error, errorIndex) {
                    if (error.rule === 'required') {
                        error.message = 'This field is required.';
                        errors[fieldIndex][errorIndex] = error;
                    }
                });

                vm.errors[fieldIndex] = errors[fieldIndex];
            });
        }

        function checkValidation(field = false) {
            const requiredFields = [
                'name'
            ];

            if (field) {
                vm.errors[field] = ValidateService.validate(vm.institute, field, requiredFields);

                if (typeof vm.errors[field] === 'undefined') {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = ValidateService.validate(vm.institute, false, requiredFields);
            }

            if (Object.keys(vm.errors).length > 0) {
                vm.errorText = 'Please correct the errors on this form!';
            } else {
                vm.errorText = '';
            }
        }

        function fieldValueHasChanged(field = false) {
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
                checkValidation(field);
            }, delay);
        }

        /* jshint ignore:start */
        async function saveInstitute() {
            if (!vm.institute)
                return;

            checkValidation();

            if (!isValid())
                return;

            if (!vm.institute.parentId) vm.institute.parentId = null;
            if (!vm.institute.group) vm.institute.group = null;

            if (!vm.institute.id) {
                try {
                    await Restangular.all('institutes').post(vm.institute);
                    Notification.info('Institute created');
                    vm.institute = {};
                    vm.errors = {};
                } catch (err) {
                    checkErrorMessages(err.data.invalidAttributes);
                    vm.onFailure()();
                    return;
                }
            } else {
                for (const field in vm.institute)
                    if (vm.institute[field] === '')
                        vm.institute[field] = null;

                try {
                    await vm.institute.save();
                    Notification.info('Institute saved');
                    vm.institute = {};
                    vm.errors = {};
                } catch (err) {
                    checkErrorMessages(err.data.invalidAttributes);
                    vm.onFailure()();
                    return;
                }
            }


            vm.onSubmit()(1);
        }

        /* jshint ignore:end */

        function close() {
            if (_.isFunction(vm.checkAndClose()))
                vm.checkAndClose()(() => !unsavedData);
        }
    }
})();