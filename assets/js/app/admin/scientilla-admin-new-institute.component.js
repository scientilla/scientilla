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
        'Notification',
        'Restangular',
        'ModalService'
    ];

    function scientillaAdminNewInstituteController(Notification, Restangular, ModalService) {
        const vm = this;

        vm.saveInstitute = saveInstitute;
        vm.cancel = cancel;
        vm.invalidAttributes = {};

        function saveInstitute() {
            if (!vm.institute)
                return;

            if (!vm.institute.id) {
                Restangular.all('institutes')
                    .post(vm.institute)
                    .then(() => {
                        Notification.info('Institute created');
                        vm.institute = {};
                        vm.invalidAttributes = {};
                        cancel();
                    }, function (res) {
                        vm.invalidAttributes = res.data.invalidAttributes;
                    });
            } else {
                for (const field in vm.institute)
                    if (vm.institute[field] === '')
                        vm.institute[field] = null;

                vm.institute.save()
                    .then(() => {
                        Notification.info('Institute saved');
                        vm.institute = undefined;
                        cancel();
                    }, function (res) {
                        vm.invalidAttributes = res.data.invalidAttributes;
                    });
            }
        }

        function cancel() {
            if (_.isFunction(vm.closeFn()))
                return vm.closeFn()();
            return Promise.reject('no close function');
        }
    }
})();