(function () {
    'use strict';

    angular.module('documents')
            .component('scientillaDocumentType', {
                templateUrl: 'partials/scientilla-document-type.html',
                controller: scientillaDocumentType,
                controllerAs: 'vm',
                bindings: {
                    document: "<"
                }
            });

    scientillaDocumentType.$inject = [
        'DocumentTypesService'
    ];

    function scientillaDocumentType(DocumentTypesService) {
        const vm = this;
        const documentTypes = DocumentTypesService.getDocumentTypes();
        vm.documentType = documentTypes.find(t => t.key === vm.document.type);

        activate();
        
        function activate() {
            
        }
        
    }

})();