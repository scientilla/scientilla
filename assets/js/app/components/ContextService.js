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

        let researchEntity, documentService;
        const service = {
            setResearchEntity: setResearchEntity,
            getResearchEntity: getResearchEntity,
            reset: reset,
            getDocumentService: getDocumentService
        };

        return service;

        function getResearchEntity(){
            return researchEntity;
        }

        function setResearchEntity(re){
            researchEntity = re;
            if (researchEntity.getType() === 'user')
                documentService = UserDocumentsServiceFactory.create(researchEntity);
            else
                documentService = GroupDocumentsServiceFactory.create(researchEntity);


            EventsService.publish(EventsService.CONTEXT_CHANGE);
        }

        function setDocumentService(ds) {
            documentService = ds;
        }

        function reset( ) {
            researchEntity = null;
            documentService = null;
        }

        function getDocumentService() {
            return documentService;
        }
    }
}());