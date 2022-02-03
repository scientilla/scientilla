(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementDetails', {
            templateUrl: 'partials/scientilla-agreement-details.html',
            controller: scientillaAgreementDetails,
            controllerAs: 'vm',
            bindings: {
                agreement: "<"
            }
        });

    scientillaAgreementDetails.$inject = [];

    function scientillaAgreementDetails() {
        const vm = this;

        vm.$onInit = function () {
        };

        vm.getTypeLabel = type => {
            const agreementType = agreementTypes.find(t => t.key === type);
            if (agreementType) {
                return agreementType.label;
            }
            return '';
        };
    }

})();
