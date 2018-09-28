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
        '$rootScope',
        'context',
        'Restangular',
        'ModalService'
    ];

    function scientillaSourceFormController($rootScope, context, Restangular, ModalService) {
        const vm = this;

        vm.createSource = createSource;
        vm.cancel = cancel;

        function createSource() {

            if (vm.newSource) {
                vm.newSource.type = vm.document.sourceType;
            } else {
                vm.newSource = {};
            }

            Restangular.all('sources')
                .post(vm.newSource)
                .then(source => {
                    $rootScope.$emit('newSource', source);
                    vm.newSource = {};
                    cancel();
                }, function(res) {
                    vm.invalidAttributes = res.data.invalidAttributes;
                });
        }

        function cancel() {
            if (_.isFunction(vm.closeFn()))
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }
})();