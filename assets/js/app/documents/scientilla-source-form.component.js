/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaSourceForm', {
            templateUrl: 'partials/scientilla-source-form.html',
            controller: scientillaSourceFormController,
            controllerAs: 'vm',
            bindings: {
                document: "<",
                onFailure: "&",
                onSubmit: "&",
                closeFn: "&"
            }
        });

    scientillaSourceFormController.$inject = [
        'context',
        'Restangular',
        'ModalService',
        'EventsService',
        '$scope',
        'ValidateService',
        '$timeout'
    ];

    function scientillaSourceFormController(context, Restangular, ModalService, EventsService, $scope, ValidateService, $timeout) {
        const vm = this;

        vm.createSource = createSource;
        vm.cancel = cancel;
        vm.checkValidation = checkValidation;
        vm.fieldValueHasChanged = fieldValueHasChanged;
        vm.isValid = isValid;
        vm.errors = {};
        vm.errorText = '';

        let emptySource = {};
        let closed = false;
        let timeout;

        const delay = 500;

        vm.$onInit = function () {
            $scope.$on('modal.closing', function (event, reason) {
                cancel(event);
            });
        };

        function isValid() {
            if (Object.keys(vm.errors).length > 0) {
                return false;
            } else {
                return true;
            }
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
                vm.newSource.type = vm.document.sourceType;
            } else {
                vm.newSource = {};
            }

            checkValidation();

            if (Object.keys(vm.errors).length > 0) {
                return;
            }

            Restangular.all('sources')
                .post(vm.newSource)
                .then(source => {
                    EventsService.publish(EventsService.SOURCE_CREATED, source);
                    vm.newSource = {};
                    cancel();
                }, function(res) {
                    vm.errors = res.data.invalidAttributes;

                    angular.forEach(vm.errors, function(fields, fieldIndex) {
                        angular.forEach(fields, function(error, errorIndex) {
                            if (error.rule === 'required'){
                                error.message = 'This field is required.';
                                vm.errors[fieldIndex][errorIndex] = error;
                            }
                        });
                    });

                    vm.errorText = 'Please correct the errors on this form!';
                });
        }

        function cancel(event = false) {
            if (!_.isFunction(vm.closeFn())){
                return Promise.reject('no close function');
            }

            if (!closed) {
                // Check if the new source is still empty
                if (typeof vm.newSource === 'undefined' || angular.toJson(emptySource) === angular.toJson(vm.newSource)) {
                    closed = true;
                    if (!event) {
                        return vm.closeFn()();
                    }
                } else {
                    if (event) {
                        // Prevent modal from closing
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
                                    vm.newSource = emptySource;
                                    closed = true;
                                    return vm.closeFn()();
                                default:
                                    break;
                            }
                        });
                }
            }
        }
    }
})();