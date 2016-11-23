(function () {
    'use strict';

    angular.module('documents')
        .component('scientillaExternalDocuments', {
            templateUrl: 'partials/scientillaExternalDocuments.html',
            controller: scientillaExternalDocuments,
            controllerAs: 'vm',
            bindings: {
                researchEntity: "="
            }
        });

    scientillaExternalDocuments.$inject = [
        'context',
        'ResearchEntityFormsFactory'
    ];

    function scientillaExternalDocuments(context, ResearchEntityFormsFactory) {
        var vm = this;

        var DocumentService = context.getDocumentService();

        vm.copyDocument = DocumentService.copyDocument;
        vm.copyDocuments = DocumentService.copyDocuments;
        vm.onFilter = onFilter;

        vm.documents = [];
        var query = {};


        vm.$onInit = function () {
            var ResearchEntityForms = ResearchEntityFormsFactory(vm);

            ResearchEntityForms.setExternalForm();
        };

        function onFilter(q) {
            query = q;

            return DocumentService.getExternalDocuments(query)
                .then(function (documents) {
                    vm.documents = documents;
                });
        }

    }
})();
