/* global Scientilla */

(function () {
    'use strict';

    angular.module('references')
        .directive('scientillaDraftsList', scientillaDraftsList);

    function scientillaDraftsList() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaDraftsList.html',
            controller: scientillaDrafsListController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaDrafsListController.$inject = [
        'DocumentsServiceFactory',
        'researchEntityService',
        'documentSearchForm',
        'EventsService'
    ];

    function scientillaDrafsListController(DocumentsServiceFactory, researchEntityService, documentSearchForm, EventsService) {
        var vm = this;

        var DocumentsService = DocumentsServiceFactory.create(vm.researchEntity);

        vm.getData = getDrafts;
        vm.onFilter = refreshList;

        vm.deleteDraft = DocumentsService.deleteDraft;
        vm.verifyDraft = DocumentsService.verifyDraft;
        vm.openEditPopup = DocumentsService.openEditPopup;
        vm.deleteDrafts = DocumentsService.deleteDrafts;
        vm.verifyDrafts = DocumentsService.verifyDrafts;

        vm.searchForm = documentSearchForm;

        var query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.DRAFT_DELETED,
                EventsService.DRAFT_UPDATED,
                EventsService.DRAFT_CREATED,
                EventsService.DRAFT_VERIFIED,
                EventsService.DRAFT_UNVERIFIED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function getDrafts(q) {
            query = q;

            return researchEntityService.getDrafts(vm.researchEntity, q);
        }

        function refreshList(drafts) {
            vm.drafts = drafts;
        }

        // private
        function updateList() {
            getDrafts(query).then(refreshList);
        }
    }

})();
