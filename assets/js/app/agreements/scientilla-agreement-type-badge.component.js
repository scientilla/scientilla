(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementTypeBadge', {
            templateUrl: 'partials/scientilla-agreement-type-badge.html',
            controller: scientillaAgreementTypeBadge,
            controllerAs: 'vm',
            bindings: {
                type: "<"
            }
        });

    scientillaAgreementTypeBadge.$inject = [];

    function scientillaAgreementTypeBadge() {
        const vm = this;

        vm.$onInit = function () {
        };
    }

})();