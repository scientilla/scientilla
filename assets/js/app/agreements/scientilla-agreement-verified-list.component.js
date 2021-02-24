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
        'ProjectService',
        'AgreementService',
        'EventsService',
        'agreementListSections',
        'context',
        'ModalService'
    ];

    function controller(
        ProjectService,
        AgreementService,
        EventsService,
        agreementListSections,
        context,
        ModalService
    ) {
        const vm = this;

        vm.agreementListSections = agreementListSections;
        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.unverify = (agreement) => ProjectService.unverify(vm.researchEntity, agreement);
        vm.exportDownload = agreements => AgreementService.exportDownload(agreements, 'csv');

        let query = {
            where: {}
        };

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();
            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        vm.generateGroup = function (agreement) {
            ModalService.openGenerateAgreementGroup(agreement);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            const favorites = q.where.favorites;
            delete q.where.favorites;
            q.where.type = 'project_agreement'

            vm.agreements = await ProjectService.get(vm.researchEntity, q, favorites);
        }

        /* jshint ignore:end */
    }

})();