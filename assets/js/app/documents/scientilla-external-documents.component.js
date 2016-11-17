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
        vm.getData = DocumentService.getExternalDocuments;
        vm.onFilter = refreshExternalDocuments;
        vm.copyDocuments = DocumentService.copyDocuments;


        vm.$onInit = function () {
            var ResearchEntityForms = ResearchEntityFormsFactory(vm);

            ResearchEntityForms.setExternalForm();

            reset();
        };

        function refreshExternalDocuments(documents) {
            vm.documents = documents;
        }

        //private
        function reset() {
            vm.documents = [];
        }


    }
})();
