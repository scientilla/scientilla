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
        'ModalService',
        'Notification',
        '$rootScope',
        'researchEntityService',
        'documentSearchForm'
    ];

    function scientillaDrafsListController(ModalService, Notification, $rootScope, researchEntityService, documentSearchForm) {
        var vm = this;

        vm.getData = getDrafts;
        vm.onFilter = refreshList;

        vm.deleteDraft = deleteDraft;
        vm.verifyDraft = verifyDraft;
        vm.openEditPopup = openEditPopup;
        vm.verifyDrafts = verifyDrafts;

        vm.searchForm = documentSearchForm;

        var query = {};

        activate();

        function activate() {
            $rootScope.$on("draft.updated", updateList);
            $rootScope.$on("draft.created", updateList);
            $rootScope.$on("draft.verified", updateList);
            $rootScope.$on('draft.unverified', updateList);
        }

        function getDrafts(q) {

            query = q;

            return researchEntityService.getDrafts(vm.researchEntity, q);
        }

        function deleteDraft(draft) {
            vm.researchEntity
                    .one('drafts', draft.id)
                    .remove()
                    .then(function () {
                        Notification.success("Draft deleted");
                        updateList();
                    })
                    .catch(function () {
                        Notification.warning("Failed to delete draft");
                    });
        }

        function verifyDrafts(drafts) {
            var draftIds = _.map(drafts, 'id');
            researchEntityService
                    .verifyDrafts(vm.researchEntity, draftIds)
                    .then(function(allDocs) {
                        var partitions = _.partition(allDocs, 'draft');
                        var drafts = partitions[0];
                        var documents = partitions[1];
                        Notification.success(documents.length + " draft(s) verified");
                        Notification.warning(drafts.length + " is/are not valid and cannot be verified");
                        $rootScope.$broadcast("draft.verified", documents);
                    })
                    .catch(function(err) {
                        $rootScope.$broadcast("draft.verified", []);
                        Notification.warning("An error happened");
                    });
        };
        
        function verifyDraft(reference) {
            return researchEntityService.verifyDraft(vm.researchEntity, reference)
                    .then(function (document) {
                        if (document.draft) {
                            Notification.warning("Draft is not valid and cannot be verified");
                        }
                        else {
                            Notification.success("Draft verified");
                            $rootScope.$broadcast("draft.verified", document);
                            updateList();
                        }
                    })
                    .catch(function () {
                        Notification.warning("Failed to verify draft");
                    });

        }

        function openEditPopup(document) {
            ModalService
                    .openScientillaDocumentForm(document.clone(), vm.researchEntity)
                    .finally(function () {
                        updateList();
                    });
        }

        function refreshList(drafts) {
            Scientilla.toDocumentsCollection(drafts);
            vm.drafts = drafts;
        }

        // private
        function updateList() {
            getDrafts(query).then(refreshList);
        }
    }

})();
