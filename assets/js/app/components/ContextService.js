(function () {
    angular.module("components").factory("context", context);

    context.$inject = [
        'EventsService',
        'UserDocumentsServiceFactory',
        'GroupDocumentsServiceFactory'
    ];

    function context(EventsService,
                     UserDocumentsServiceFactory,
                     GroupDocumentsServiceFactory) {

        var service = { researchEntity: null};

        service.setResearchEntity = setResearchEntity;
        service.getResearchEntity = getResearchEntity;
        service.getDocumentService = getDocumentService;

        return service;

        function getResearchEntity(){
            return service.researchEntity;
        }

        function setResearchEntity(researchEntity){
            service.researchEntity = researchEntity;
            let documentService;
            if (researchEntity.getType() === 'user')
                documentService = UserDocumentsServiceFactory.create(researchEntity);
            else
                documentService = GroupDocumentsServiceFactory.create(researchEntity);
            setDocumentService(documentService);


            EventsService.publish(EventsService.CONTEXT_CHANGE);
        }

        function setDocumentService(documentService) {
            service.documentService = documentService;
        }

        function getDocumentService() {
            return service.documentService;
        }
    }
}());