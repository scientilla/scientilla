/* global angular */
(function () {
    "use strict";

    angular
        .module('app')
        .component('scientillaGenerateAgreementGroupForm', {
            templateUrl: 'partials/scientilla-generate-agreement-group-form.html',
            controller: scientillaGenerateAgreementGroupFormController,
            controllerAs: 'vm',
            bindings: {
                agreement: "<",
                closeFn: "&",
                checkAndClose: "&"
            }
        });

    scientillaGenerateAgreementGroupFormController.$inject = [];

    function scientillaGenerateAgreementGroupFormController() {
        const vm = this;

        vm.cancel = close;

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