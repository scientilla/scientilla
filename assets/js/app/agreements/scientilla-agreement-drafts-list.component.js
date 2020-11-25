/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementDraftsList', {
            templateUrl: 'partials/scientilla-agreement-drafts-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    controller.$inject = [
        'context',
        'AgreementService',
        'agreementListSections',
        'EventsService'
    ];

    function controller(
        context,
        AgreementService,
        agreementListSections,
        EventsService
    ) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = AgreementService.isValid;

        vm.deleteDraft = AgreementService.delete;
        vm.edit = (draft) => AgreementService.edit(vm.researchEntity, draft);
        vm.verify = (draft) => AgreementService.verify(vm.researchEntity, draft);
        vm.deleteDrafts = (drafts) => AgreementService.multipleDelete(vm.researchEntity, drafts);
        vm.verifyDrafts = (drafts) => AgreementService.multipleVerify(vm.researchEntity, drafts);
        vm.agreementListSections = agreementListSections;
        vm.editAffiliations = (draft) => AgreementService.editAffiliations(vm.researchEntity, draft);

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_DELETED,
                EventsService.RESEARCH_ITEM_DRAFT_UPDATED,
                EventsService.RESEARCH_ITEM_DRAFT_CREATED,
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        async function onFilter(q) {
            query = q;

            vm.drafts = await AgreementService.getDrafts(vm.researchEntity, q);
        }

        /* jshint ignore:end */

    }

})();