/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementVerifiedList', {
            templateUrl: 'partials/scientilla-agreement-verified-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {}
        });

    controller.$inject = [
        'AgreementService',
        'agreementListSections',
        'context'
    ];

    function controller(
        AgreementService,
        agreementListSections,
        context
    ) {
        const vm = this;

        vm.agreementListSections = agreementListSections;
        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.exportDownload = agreements => AgreementService.exportDownload(agreements, 'csv');

        let query = {
            where: {}
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {

        };

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;

            query = q;

            vm.agreements = await AgreementService.get(vm.researchEntity, query, favorites);
        }
        /* jshint ignore:end */
    }

})();