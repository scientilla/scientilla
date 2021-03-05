/* global angular */
(function () {
    'use strict';

    angular.module('agreements')
        .component('scientillaAgreementDraftsList', {
            templateUrl: 'partials/scientilla-agreement-drafts-list.html',
            controller,
            controllerAs: 'vm',
            bindings: {
            }
        });

    controller.$inject = [
        'context',
        'ProjectService',
        'agreementListSections',
        'EventsService',
        'agreementRequiredFields',
        'agreementFieldRules'
    ];

    function controller(
        context,
        ProjectService,
        agreementListSections,
        EventsService,
        agreementRequiredFields,
        agreementFieldRules
    ) {
        const vm = this;

        vm.agreements = [];
        vm.onFilter = onFilter;
        vm.isValid = ProjectService.isValid;

        vm.deleteDraft = ProjectService.delete;
        vm.edit = (draft) => ProjectService.editAgreement(vm.researchEntity, draft);
        vm.verify = (draft) => ProjectService.verify(vm.researchEntity, draft);
        vm.deleteDrafts = (drafts) => ProjectService.multipleDelete(vm.researchEntity, drafts);
        vm.verifyDrafts = (drafts) => ProjectService.multipleVerify(vm.researchEntity, drafts);
        vm.agreementListSections = agreementListSections;
        vm.agreementRequiredFields = agreementRequiredFields;
        vm.agreementFieldRules = agreementFieldRules;

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
            if(!q.where)
                q.where = {};
            q.where.type = 'project_agreement'
            vm.agreements = await ProjectService.getDrafts(vm.researchEntity, q);
        }
        /* jshint ignore:end */

    }

})();