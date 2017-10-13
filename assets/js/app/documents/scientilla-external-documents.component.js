(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaExternalDocuments', {
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocuments,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaExternalDocuments.$inject = [
        'context',
        'documentSearchForm',
        'documentListSections'
    ];

    function scientillaExternalDocuments(context, documentSearchForm, documentListSections) {
        const vm = this;

        const DocumentService = context.getDocumentService();

        vm.copyDocument = DocumentService.copyDocument;
        vm.copyDocuments = DocumentService.copyDocuments;
        vm.copyUncopiedDocuments = DocumentService.copyUncopiedDocuments;
        vm.onFilter = onFilter;

        vm.documentListSections = documentListSections;
        vm.documents = [];
        let query = {};


        vm.$onInit = function () {
            vm.searchForm = Object.assign({},
                {
                    connector: getConnectorField(),
                    newline1: {
                        inputType: 'br'
                    }
                },
                documentSearchForm
            );
        };

        function onFilter(q) {
            query = q;

            return DocumentService.getExternalDocuments(query)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }

        function getConnectorField() {
            const connectors = vm.researchEntity.getExternalConnectors();
            const values = _.concat(
                connectors.map(function (c) {
                    return {value: c.value, label: c.label};
                }));

            return {
                inputType: 'select',
                label: 'Connector',
                values: values,
                matchColumn: 'origin',
                defaultValue: 'scopus'
            };
        }


    }
})();
