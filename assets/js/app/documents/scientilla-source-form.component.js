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
        '$scope'
    ];

    function scientillaSourceFormController(context, Restangular, ModalService, EventsService, $scope) {
        const vm = this;

        vm.createSource = createSource;
        vm.cancel = cancel;
        vm.errors = {};
        vm.errorText = '';

        let emptySource = {};
        let closed = false;

        vm.$onInit = function () {
            $scope.$on('modal.closing', function (event, reason) {
                cancel(event);
            });
        };

        function createSource() {

            if (vm.newSource) {
                vm.newSource.type = vm.document.sourceType;
            } else {
                vm.newSource = {};
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
                if (angular.toJson(emptySource) === angular.toJson(vm.newSource)) {
                    closed = true;
                    return vm.closeFn()();
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