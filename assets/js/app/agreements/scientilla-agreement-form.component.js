/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaAgreementForm', {
            templateUrl: 'partials/scientilla-agreement-form.html',
            controller: scientillaAgreementFormController,
            controllerAs: 'vm',
            bindings: {
                agreement: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    scientillaAgreementFormController.$inject = [];

    function scientillaAgreementFormController() {
        const vm = this;

        vm.cancel = close;

        vm.saveStatus = {
            state: 'ready to save',
            message: 'Save draft'
        };

        vm.verifyStatus = {
            state: 'ready to verify',
            message: 'Save & verify'
        };

        vm.datePickerOptions = {
            showWeeks: false
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {

        };

        function close() {
            if (_.isFunction(vm.checkAndClose()))
                vm.checkAndClose()(() => !vm.unsavedData);
        }

        /* jshint ignore:end */
    }
})();