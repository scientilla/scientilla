/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreement', {
            templateUrl: 'partials/scientilla-agreement.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                agreement: '<',
                section: '<'
            }
        });

    controller.$inject = [
        'AgreementService',
        'ModalService',
        'TextService'
    ];

    function controller(
        AgreementService,
        ModalService,
        TextService
    ) {

        const vm = this;
        vm.openDetails = openDetails;
        vm.getVerifiedNamesHTML = getVerifiedNamesHTML;

        vm.$onInit = function () {
            vm.agreement.status = AgreementService.getStatus(vm.agreement);
        };

        vm.getAgreementYears = () => {
            const years = [];
            if (vm.agreement.startYear) {
                years.push(vm.agreement.startYear);
            }

            if (vm.agreement.endYear) {
                years.push(vm.agreement.endYear);
            }

            return TextService.joinStrings(years, ' - ');
        };

        vm.getTypeLabel = type => {
            return agreementTypes.find(t => t.key === type).label;
        };

        function openDetails() {
            ModalService
                .openAgreementDetails(vm.agreement);
        }

        function getVerifiedNamesHTML() {
            const verifiedNames = getVerifiedNames();
            if (!verifiedNames.length)
                return 'Nobody has verified this agreement yet';

            return '<p>This agreement is verified by:</p><p>' + verifiedNames.join('<br>') + '</p>';
        }

        function getVerifiedNames() {
            return vm.agreement.verifiedGroups.map(g => '- <strong>' + g.name + '</strong>')
                .concat(vm.agreement.verifiedUsers.map(a =>  '- ' + a.getDisplayName()));
        }
    }
})();
