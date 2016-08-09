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
        'DocumentsServiceFactory',
        'researchEntityService',
        '$q'
    ];

    function scientillaExternalDocumentsController(Notification, DocumentsServiceFactory, researchEntityService, $q) {
        var vm = this;
        
        var DocumentService = DocumentsServiceFactory.create(vm.researchEntity);
        vm.STATUS_WAITING = 0;
        vm.STATUS_LOADING = 1;
        vm.STATUS_READY = 2;
        vm.STATUS_ERROR = 3;
        vm.copyDocument = DocumentService.copyDocument;
        vm.getData = getExternalReferences;
        vm.onFilter = refreshExternalDocuments;
        vm.copyDocuments = DocumentService.copyDocuments;

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
            vm.documents = documents;
            vm.status = vm.STATUS_READY;
        }

    }
})();
