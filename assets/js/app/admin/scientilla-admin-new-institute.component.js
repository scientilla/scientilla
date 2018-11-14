/* global Scientilla */

(function () {
    "use strict";

    angular
        .module('documents')
        .component('scientillaAdminNewInstitute', {
            templateUrl: 'partials/scientilla-admin-new-institute.html',
            controller: scientillaAdminNewInstituteController,
            controllerAs: 'vm',
            bindings: {
                institute: "<",
                onFailure: "&",
                onSubmit: "&",
                closeFn: "&"
            }
        });

    scientillaAdminNewInstituteController.$inject = [
        '$scope',
        'Notification',
        'Restangular',
        'ModalService',
        'EventsService'
    ];

    function scientillaAdminNewInstituteController($scope, Notification, Restangular, ModalService, EventsService) {
        const vm = this;

        vm.saveInstitute = saveInstitute;
        vm.cancel = cancel;
        vm.errors = {};

        let originalInstitute = {};

        vm.$onInit = function() {
            originalInstitute = angular.copy(vm.institute);

            // Listen to modal closing event
            $scope.$on('modal.closing', function(event, reason) {
                cancel(event, reason);
            });
        };

        function checkErrorMessages(errors) {
            vm.errors = {};

            angular.forEach(errors, function(fields, fieldIndex) {
                angular.forEach(fields, function(error, errorIndex) {
                    if (error.rule === 'required'){
                        error.message = 'This field is required.';
                        errors[fieldIndex][errorIndex] = error;
                    }
                });

                vm.errors[fieldIndex] = errors[fieldIndex];
            });
        }

        function saveInstitute() {
            if (!vm.institute)
                return;

            if (!vm.institute.id) {
                Restangular.all('institutes')
                    .post(vm.institute)
                    .then(() => {
                        Notification.info('Institute created');
                        vm.institute = {};
                        originalInstitute = angular.copy(vm.institute);
                        vm.errors = {};
                        cancel();
                    }, function (res) {
                        checkErrorMessages(res.data.invalidAttributes);
                    });
            } else {
                for (const field in vm.institute)
                    if (vm.institute[field] === '')
                        vm.institute[field] = null;

                vm.institute.save()
                    .then(() => {
                        Notification.info('Institute saved');
                        vm.institute = {};
                        originalInstitute = angular.copy(vm.institute);
                        vm.errors = {};
                        cancel();
                    }, function (res) {
                        checkErrorMessages(res.data.invalidAttributes);
                    });
            }
        }

        function cancel(event = false) {
            // Compare the current state with the original state of the institute
            if (angular.toJson(vm.institute) === angular.toJson(originalInstitute)) {
                if (!event) {
                    executeOnSubmit(0);
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
                                vm.institute = angular.copy(originalInstitute);
                                EventsService.publish(EventsService.INSTITUTE_RESTORED, originalInstitute);
                                executeOnSubmit(0);
                                break;
                            default:
                                break;
                        }
                    });
            }
        }

        function executeOnSubmit(i) {
            if (_.isFunction(vm.onSubmit()))
                vm.onSubmit()(i);
        }
    }
})();