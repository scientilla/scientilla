/* global angular */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaSourceForm', {
            templateUrl: 'partials/scientilla-source-form.html',
            controller: scientillaSourceFormController,
            controllerAs: 'vm',
            bindings: {
                sourceType: "<",
                onFailure: "&",
                onSubmit: "&",
                checkAndClose: "&"
            }
        });

    scientillaSourceFormController.$inject = [
        'context',
        'Restangular',
        'ModalService',
        'EventsService',
        'DocumentTypesService',
        '$scope',
        'ValidateService',
        '$timeout'
    ];

    function scientillaSourceFormController(context, Restangular, ModalService, EventsService, DocumentTypesService, $scope, ValidateService, $timeout) {
        const vm = this;

        vm.createSource = createSource;
        vm.cancel = cancel;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;
        vm.isValid = isValid;
        vm.errors = {};
        vm.errorText = '';

        let timeout;

        const delay = 500;

        vm.$onInit = function () {
            vm.sourceTypes = DocumentTypesService.getSourceTypes().filter(st => st.type === 'scientific');
            vm.hasSourceType = !!vm.sourceType;
        };

        function isValid() {
            return !!_.isEmpty(vm.errors);
        }

        function checkValidation(field = false) {
            const requiredFields = [
                'title'
            ];

            if (field) {
                vm.errors[field] = ValidateService.validate(vm.newSource, field, requiredFields);

                if (typeof vm.errors[field] === 'undefined') {
                    delete vm.errors[field];
                }
            } else {
                vm.errors = ValidateService.validate(vm.newSource, false, requiredFields);
            }

            if (!_.isEmpty(vm.errors)) {
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

        function createSource() {

            if (vm.newSource) {
                vm.newSource.type = vm.sourceType;
            } else {
                vm.newSource = {};
            }

            checkValidation();

            if (!_.isEmpty(vm.errors)) {
                return;
            }

            Restangular.all('sources')
                .post(vm.newSource)
                .then(source => {
                    EventsService.publish(EventsService.SOURCE_CREATED, source);
                    vm.newSource = {};
                    cancel();
                }, function (res) {
                    vm.errors = res.data.invalidAttributes;

                    angular.forEach(vm.errors, function (fields, fieldIndex) {
                        angular.forEach(fields, function (error, errorIndex) {
                            if (error.rule === 'required') {
                                error.message = 'This field is required.';
                                vm.errors[fieldIndex][errorIndex] = error;
                            }
                        });
                    });

                    vm.errorText = 'Please correct the errors on this form!';
                });
        }

        function cancel() {
            vm.checkAndClose()(() => typeof vm.newSource === 'undefined' || angular.toJson({}) === angular.toJson(vm.newSource));
        }
    }
})();