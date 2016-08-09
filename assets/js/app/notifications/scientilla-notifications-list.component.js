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
        'DocumentsServiceFactory',
        'researchEntityService',
        '$rootScope'
    ];

    function ScientillaNotificationsListController(DocumentsServiceFactory, researchEntityService, $rootScope) {
        var vm = this;
        
        var DocumentsService = DocumentsServiceFactory.create(vm.researchEntity);
        vm.copyDocument = DocumentsService.copyDocument;
        vm.verifyDocument = DocumentsService.verifyDocument;
        vm.verifyDocuments = DocumentsService.verifyDocuments;
        vm.discardDocument = DocumentsService.discardDocument;
        vm.copyDocuments = DocumentsService.copyDocuments;
        vm.discardDocuments = DocumentsService.discardDocuments;
        var query = {};
        vm.documents = [];

        vm.refreshList = refreshList;
        vm.getData = getData;

        vm.searchForm = {
            rejected: {
                inputType: 'checkbox',
                label: 'Include discarded documents',
                defaultValue: false,
                matchColumn: 'discarded',
                matchRule: 'is null'
            }
        };
        
        activate();
        
        function activate() {
            $rootScope.$on('notification.accepted', reload);
            $rootScope.$on('notification.discarded', reload);
        }

        function getData(q) {
            query = q;
            return researchEntityService.getSuggestedDocuments(vm.researchEntity, query);
        }

        function refreshList(documents) {
            vm.documents = documents;
        }

        // private
        function reload() {
            getData(query).then(refreshList);
        }
    }
})();
