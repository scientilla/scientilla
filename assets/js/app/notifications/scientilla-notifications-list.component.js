/* global Scientilla */

(function () {
    angular
        .module('groups')
        .component('scientillaNotificationsList', {
            templateUrl: 'partials/scientillaNotificationsList.html',
            controller: ScientillaNotificationsListController,
            controllerAs: 'vm',
            bindings: {
                researchEntity: "<"
            }
        });

    ScientillaNotificationsListController.$inject = [
        'context',
        'researchEntityService',
        'EventsService'
    ];

    function ScientillaNotificationsListController(context, researchEntityService, EventsService) {
        var vm = this;

        var DocumentsService = context.getDocumentService();

        vm.copyDocument = DocumentsService.copyDocument;
        vm.verifyDocument = DocumentsService.verifyDocument;
        vm.verifyDocuments = DocumentsService.verifyDocuments;
        vm.discardDocument = DocumentsService.discardDocument;
        vm.copyDocuments = DocumentsService.copyDocuments;
        vm.discardDocuments = DocumentsService.discardDocuments;
        vm.documents = [];
        var query = {};

        vm.onFilter = onFilter;

        vm.searchForm = {
            rejected: {
                inputType: 'checkbox',
                label: 'Show discarded documents',
                defaultValue: false,
                matchColumn: 'discarded'
            }
        };

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.NOTIFICATION_ACCEPTED,
                EventsService.NOTIFICATION_DISCARDED,
                EventsService.DRAFT_UNVERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DOCUMENT_USER_TAGS_UPDATED
            ], updateList);
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            return getData(q)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }

        //private
        function getData(q) {
            var discarded = q.where.discarded;
            delete q.where.discarded;
            query = q;


            if (!discarded)
                return researchEntityService.getSuggestedDocuments(vm.researchEntity, query);
            else
                return researchEntityService.getDiscardedDocuments(vm.researchEntity, query);
        }

    }
})();
