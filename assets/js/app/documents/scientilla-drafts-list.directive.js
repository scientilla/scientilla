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
        '$rootScope',
        'researchEntityService',
        'documentSearchForm'
    ];

    function scientillaDrafsListController(DocumentsServiceFactory, $rootScope, researchEntityService, documentSearchForm) {
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

        activate();

        function activate() {
            $rootScope.$on("draft.deleted", updateList);
            $rootScope.$on("draft.updated", updateList);
            $rootScope.$on("draft.created", updateList);
            $rootScope.$on("draft.verified", updateList);
            $rootScope.$on('draft.unverified', updateList);
        }

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
