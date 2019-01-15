(function () {
    'use strict';

    angular.module('accomplishments')
        .component('scientillaAccomplishmentDraftsList', {
            templateUrl: 'partials/scientilla-accomplishment-drafts-list.html',
            controller: scientillaAccomplishmentDraftsList,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaAccomplishmentDraftsList.$inject = [
        'context',
        'researchEntityService',
        'accomplishmentSearchForm',
        'accomplishmentListSections',
        'EventsService'
    ];

    function scientillaAccomplishmentDraftsList(
        context,
        researchEntityService,
        accomplishmentSearchForm,
        accomplishmentListSections,
        EventsService
    ) {
        var vm = this;

        var AccomplishmentsService = context.getAccomplishmentService();

        vm.onFilter = onFilter;

        vm.deleteDraft = AccomplishmentsService.deleteDraft;
        vm.verifyDraft = AccomplishmentsService.verifyDraft;
        vm.openEditPopup = AccomplishmentsService.openEditPopup;
        vm.openAccomplishmentAffiliationForm = AccomplishmentsService.openAccomplishmentAffiliationForm;
        vm.deleteDrafts = AccomplishmentsService.deleteDrafts;
        vm.verifyDrafts = AccomplishmentsService.verifyDrafts;

        vm.searchForm = accomplishmentSearchForm;
        vm.accomplishmentListSections = accomplishmentListSections;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.ACCOMPLISHMENT_DRAFT_DELETED,
                EventsService.ACCOMPLISHMENT_DRAFT_UPDATED,
                EventsService.ACCOMPLISHMENT_DRAFT_CREATED,
                EventsService.ACCOMPLISHMENT_DRAFT_VERIFIED,
                EventsService.ACCOMPLISHMENT_DRAFT_UNVERIFIED // Remove?
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            query = q;

            return researchEntityService.accomplishment.getDrafts(vm.researchEntity, q)
                .then(function (accomplishments) {
                    vm.drafts = accomplishments;
                });
        }

    }

})();