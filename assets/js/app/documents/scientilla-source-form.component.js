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
                closeFn: "&",
                closing: "<"
            }
        });

    scientillaSourceFormController.$inject = [
        'context',
        'Restangular',
        'ModalService',
        'EventsService',
        'FormService',
        '$scope'
    ];

    function scientillaSourceFormController(context, Restangular, ModalService, EventsService, FormService, $scope) {
        const vm = this;

        vm.createSource = createSource;
        vm.cancel = cancel;
        vm.errors = {};
        vm.errorText = '';

        vm.$onInit = function () {

            $scope.$watch('source.$pristine', function (formUntouched) {
                if (!formUntouched) {
                    FormService.setUnsavedData('new-source', true);
                } else {
                    FormService.setUnsavedData('new-source', false);
                }
            });

            $scope.$on('modal.closing', function (event, reason) {
                if (typeof vm.closing === "function") {
                    vm.closing(event, reason, {
                        source: vm.newSource
                    });
                }
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
                    FormService.setUnsavedData('new-source', false);
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

        function cancel() {
            if (_.isFunction(vm.closeFn()))
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }
})();