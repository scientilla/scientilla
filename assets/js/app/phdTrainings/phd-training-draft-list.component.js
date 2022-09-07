/* global angular */
(function () {
    'use strict';

    angular.module('phdTrainings')
        .component('phdTrainingDraftList', {
            templateUrl: 'partials/phd-training-draft-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'PhdTrainingService',
        'phdTrainingListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, PhdTrainingService, phdTrainingListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = PhdTrainingService.isValid;

        vm.deleteDraft = PhdTrainingService.delete;
        vm.edit = (draft) => PhdTrainingService.edit(vm.researchEntity, draft);
        vm.verify = (draft) => PhdTrainingService.verify(vm.researchEntity, draft);
        vm.deleteDrafts = (drafts) => PhdTrainingService.multipleDelete(vm.researchEntity, drafts);
        vm.verifyDrafts = (drafts) => PhdTrainingService.multipleVerify(vm.researchEntity, drafts);
        vm.editAffiliations = (draft) => PhdTrainingService.editAffiliations(vm.researchEntity, draft);
        vm.phdTrainingListSections = phdTrainingListSections;

        let query = {};

        /* jshint ignore:start */
        vm.$onInit = async function () {
            vm.researchEntity = await context.getResearchEntity();

            EventsService.subscribeAll(vm, [
                EventsService.RESEARCH_ITEM_DRAFT_DELETED,
                EventsService.RESEARCH_ITEM_DRAFT_UPDATED,
                EventsService.RESEARCH_ITEM_DRAFT_CREATED,
                EventsService.RESEARCH_ITEM_DRAFT_VERIFIED,
                EventsService.RESEARCH_ITEM_VERIFIED,
                EventsService.RESEARCH_ITEM_UNVERIFIED
            ], updateList);
        };
        /* jshint ignore:end */

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            return onFilter(query);
        }

        /* jshint ignore:start */
        async function onFilter(q) {
            query = q;

            vm.drafts = await PhdTrainingService.getDrafts(vm.researchEntity, q);
        }
        /* jshint ignore:end */
    }
})();
