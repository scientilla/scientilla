/* global angular */
(function () {
    'use strict';

    angular.module('trainingModules')
        .component('trainingModuleDraftList', {
            templateUrl: 'partials/training-module-draft-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'trainingModuleService',
        'trainingModuleListSections',
        'EventsService',
        'ModalService'
    ];

    function controller(context, trainingModuleService, trainingModuleListSections, EventsService, ModalService) {
        const vm = this;

        vm.onFilter = onFilter;
        vm.isValid = trainingModuleService.isValid;

        vm.deleteDraft = trainingModuleService.delete;
        vm.edit = (draft) => trainingModuleService.edit(vm.researchEntity, draft);
        vm.verify = (draft) => trainingModuleService.verify(vm.researchEntity, draft);
        vm.deleteDrafts = (drafts) => trainingModuleService.multipleDelete(vm.researchEntity, drafts);
        vm.verifyDrafts = (drafts) => trainingModuleService.multipleVerify(vm.researchEntity, drafts);
        vm.editAffiliations = (draft) => trainingModuleService.editAffiliations(vm.researchEntity, draft);
        vm.trainingModuleListSections = trainingModuleListSections;

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

            vm.drafts = await trainingModuleService.getDrafts(vm.researchEntity, q);
        }
        /* jshint ignore:end */
    }
})();
