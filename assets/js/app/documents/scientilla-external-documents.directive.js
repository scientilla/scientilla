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
            vm.documents = [];
        }

        function getExternalReferences(q) {
            var connector = q.where.connector;
            if (!connector)
                return $q.resolve([]);

            return researchEntityService.getExternalDrafts(vm.researchEntity, q);
        }

        function refreshExternalDocuments(documents) {
            vm.documents = documents;
        }

    }
})();
