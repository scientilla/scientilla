(function () {
    'use strict';

    angular.module('references')
        .component('scientillaExternalDocuments', {
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocuments,
            controllerAs: 'vm',
            bindings: {
                researchEntity: "="
            }
        });

    scientillaExternalDocuments.$inject = [
        'DocumentsServiceFactory',
        'researchEntityService',
        '$q'
    ];

    function scientillaExternalDocuments(DocumentsServiceFactory, researchEntityService, $q) {
        var vm = this;

        var DocumentService = DocumentsServiceFactory.create(vm.researchEntity);

        vm.copyDocument = DocumentService.copyDocument;
        vm.getData = getExternalReferences;
        vm.onFilter = refreshExternalDocuments;
        vm.copyDocuments = DocumentService.copyDocuments;



        vm.$onInit = function () {
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
        };

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
