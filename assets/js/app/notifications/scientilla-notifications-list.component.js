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
        'ModalService',
        'researchEntityService',
        'Notification',
        '$rootScope'
    ];

    function ScientillaNotificationsListController(ModalService, researchEntityService, Notification, $rootScope) {
        var vm = this;
        vm.copyDocument = copyDocument;
        vm.verifyDocument = verifyDocument;
        vm.verifyDocuments = verifyDocuments;
        vm.discardDocument = discardDocument;
        vm.copyDocuments = copyDocuments;
        vm.discardDocuments = discardDocuments;
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

        function getData(q) {
            query = q;
            return researchEntityService.getSuggestedDocuments(vm.researchEntity, query);
        }

        function refreshList(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
        }

        function copyDocument(document) {
            researchEntityService
                    .copyDocument(vm.researchEntity, document)
                    .then(function (draft) {
                        Notification.success('Document copied');
                        $rootScope.$broadcast("draft.created", draft);
                        document.addTag('copied');
                        ModalService
                                .openScientillaDocumentForm(
                                        draft.clone(),
                                        vm.researchEntity
                                        );
                    });
        }

        function copyDocuments(documents) {
            var notCopiedCocuments = documents.filter(function (d) {
                return !d.tags.includes('copied');
            });
            if (notCopiedCocuments.length === 0) {
                Notification.success("No documents to copy");
                return;
            }
            researchEntityService
                    .copyDocuments(vm.researchEntity, notCopiedCocuments)
                    .then(function (drafts) {
                        Notification.success(drafts.length + " draft(s) created");
                        documents.forEach(function (d) {
                            d.addTag('copied');
                        });
                        $rootScope.$broadcast("draft.created", drafts);
                    })
                    .catch(function (err) {
                        Notification.warning("An error happened");
                    });
        }

        function verifyDocument(document) {
            //sTODO move to a service
            researchEntityService
                    .verifyDocument(vm.researchEntity, document.id)
                    .then(function () {
                        Notification.success('Document verified');
                        reload();
                    })
                    .catch(function () {
                        Notification.warning('Failed to verify document');
                    });
        }

        function verifyDocuments(documents) {
            var documentIds = _.map(documents, 'id');
            researchEntityService
                    .verifyDocuments(vm.researchEntity, documentIds)
                    .then(function (allDocs) {
                        Notification.success(allDocs.length + " document(s) verified");
                        reload();
                    })
                    .catch(function (err) {
                        Notification.warning("An error happened");
                    });
        }

        function discardDocument(document) {
            researchEntityService
                    .discardDocument(vm.researchEntity, document.id)
                    .then(function () {
                        Notification.success('Document discarded');
                        reload();
                    })
                    .catch(function () {
                        Notification.warning('Failed to discard document');
                    });
        }

        function discardDocuments(documents) {
            var documentIds = _.map(documents, 'id');
            researchEntityService
                    .discardDocuments(vm.researchEntity, documentIds)
                    .then(function (results) {
                        var resultPartitioned = _.partition(results, function (o) {
                            return o;
                        });
                        Notification.success(resultPartitioned[0].length + " document(s) discarded");
                        reload();
                    })
                    .catch(function (err) {
                        Notification.warning("An error happened");
                    });
        }

        // private
        function reload() {
            getData(query)
                    .then(refreshList);
        }
    }
})();
