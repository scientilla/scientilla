/* global Scientilla */

(function () {
    'use strict';

    angular.module('references')
            .directive('scientillaExternalDocuments', scientillaExternalDocuments);

    function scientillaExternalDocuments() {
        return {
            restrict: 'E',
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocumentsController,
            controllerAs: 'vm',
            scope: {},
            bindToController: {
                researchEntity: "="
            }
        };
    }

    scientillaExternalDocumentsController.$inject = [
        'Notification',
        '$rootScope',
        'researchEntityService',
        'ModalService',
        '$q'
    ];

    function scientillaExternalDocumentsController(Notification, $rootScope, researchEntityService, ModalService, $q) {
        var vm = this;
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_READY = 2;
        vm.STATUS_ERROR = 3;
        vm.copyDocument = copyDocument;
        vm.getData = getExternalReferences;
        vm.onFilter = refreshExternalDocuments;
        vm.copyDocuments = copyDocuments;

        activate();

        function activate() {
            vm.connectors = vm.researchEntity.getExternalConnectors();
            var values = _.concat({value: '?', label: 'Select'}, vm.connectors.map(function (c) {
                return {value: c.name, label: c.name};
            }));
            vm.searchForm = {
                connector: {
                    inputType: 'select',
                    label: 'Connector',
                    values: values,
                    matchColumn: 'connector'
                }
            };
            reset();
        }

        function reset() {
            vm.status = vm.STATUS_WAITING;
            vm.documents = [];
        }

        function getExternalReferences(q) {
            var connector = q.where.connector;
            vm.status = vm.STATUS_LOADING;
            if (!connector)
                return $q.resolve([]);

            return researchEntityService.getExternalDrafts(vm.researchEntity, q)
                    .catch(function (err) {
                        Notification.error("External reference error");
                        vm.status = vm.STATUS_ERROR;
                    });
        }

        function refreshExternalDocuments(documents) {
            Scientilla.toDocumentsCollection(documents);
            vm.documents = documents;
            vm.status = vm.STATUS_READY;
        }

        function copyDocument(externalDocument, researchEntity) {
            ModalService
                    .openScientillaDocumentForm(
                            Scientilla.reference.copyDocument(externalDocument, researchEntity),
                            researchEntity)
                    .then(function (i) {
                        if (i > 0) {
                            externalDocument.tags.push('copied');
                        }
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

    }
})();
