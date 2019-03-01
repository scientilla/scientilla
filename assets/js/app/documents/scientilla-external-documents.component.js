(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaExternalDocuments', {
            templateUrl: 'partials/scientilla-external-documents.html',
            controller: scientillaExternalDocuments,
            controllerAs: 'vm',
            bindings: {
                researchEntity: '<'
            }
        });

    scientillaExternalDocuments.$inject = [
        'context',
        'documentSearchForm',
        'documentListSections',
        'EventsService',
        'documentCategories'
    ];

    function scientillaExternalDocuments(context, documentSearchForm, documentListSections, EventsService, documentCategories) {
        const vm = this;

        const DocumentService = context.getDocumentService();

        vm.copyDocument = DocumentService.copyDocument;
        vm.copyDocuments = DocumentService.copyDocuments;
        vm.verifyDocument = DocumentService.verifyDocument;
        vm.verifyDocuments = DocumentService.verifyDocuments;
        vm.copyUncopiedDocuments = DocumentService.copyUncopiedDocuments;
        vm.compareDocuments = DocumentService.compareDocuments;
        vm.documentCategories = documentCategories;

        vm.onFilter = onFilter;

        vm.documentListSections = documentListSections;
        vm.documents = [];
        let query = {};

        vm.$onInit = function () {
            EventsService.subscribeAll(vm, [
                EventsService.NOTIFICATION_ACCEPTED,
                EventsService.NOTIFICATION_DISCARDED,
                EventsService.DRAFT_UNVERIFIED,
                EventsService.DOCUMENT_VERIFIED,
                EventsService.DOCUMENT_COMPARE
            ], updateList);

            vm.searchForm = Object.assign({},
                {
                    connector: getConnectorField()
                },
                documentSearchForm
            );
        };

        vm.$onDestroy = function () {
            EventsService.unsubscribeAll(vm);
        };

        function updateList() {
            onFilter(query);
        }

        function onFilter(q) {
            query = q;

            return DocumentService.getExternalDocuments(query)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }

        function getConnectorField() {
            const connectors = vm.researchEntity.getExternalConnectors();
            const values = connectors.map(c => ({value: c.value, label: c.label}));

            return {
                inputType: 'select',
                label: 'Connector',
                values: values,
                matchColumn: 'origin',
                defaultValue: 'scopus',
                type: 'connector'
            };
        }


    }
})();
