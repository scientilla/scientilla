/* global angular */
(function () {
    'use strict';

    angular.module('app')
        .component('scientillaAccomplishmentDraftsList', {
            templateUrl: 'partials/scientilla-accomplishment-drafts-list.html',
            controller,
            controllerAs: 'vm'
        });

    controller.$inject = [
        'context',
        'AccomplishmentService',
        'accomplishmentListSections',
        'EventsService'
    ];

    function controller(
        context,
        AccomplishmentService,
        accomplishmentListSections,
        EventsService
    ) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = AccomplishmentService.isValid;

        vm.deleteDraft = AccomplishmentService.delete;
        vm.edit = (draft) => AccomplishmentService.edit(vm.researchEntity, draft);
        vm.verify = (draft) => AccomplishmentService.verify(vm.researchEntity, draft);
        vm.deleteDrafts = (drafts) => AccomplishmentService.multipleDelete(vm.researchEntity, drafts);
        vm.verifyDrafts = (drafts) => AccomplishmentService.verifyAll(vm.researchEntity, drafts);
        vm.accomplishmentListSections = accomplishmentListSections;
        vm.editAffiliations = (draft) => AccomplishmentService.editAffiliations(vm.researchEntity, draft);

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_DELETED,
                EventsService.RESEARCH_ITEM_DRAFT_UPDATED,
                EventsService.RESEARCH_ITEM_DRAFT_CREATED,
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
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
            if (!vm.researchEntity)
                vm.researchEntity = await context.getResearchEntity();

            vm.drafts = await AccomplishmentService.getDrafts(vm.researchEntity, q);
        }

        /* jshint ignore:end */

    }

})();