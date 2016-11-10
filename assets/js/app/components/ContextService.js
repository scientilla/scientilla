(function () {
    angular.module("components").factory("context", context);

    function context() {
        var service = { researchEntity: null};

        service.getResearchEntity = function(){
            return service.researchEntity;
        };

        service.setResearchEntity = function(researchEntity){
            service.researchEntity = researchEntity;
        };

        service.setDocumentService = function(documentService) {
            service.documentService = documentService;
        };

        service.getDocumentService = function() {
            return service.documentService;
        };

        return service;
    }
}());