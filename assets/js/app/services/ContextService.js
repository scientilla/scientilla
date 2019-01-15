(function () {
    angular.module("services").factory("context", context);

    context.$inject = [
        'EventsService',
        'UserDocumentsServiceFactory',
        'GroupDocumentsServiceFactory',
        'UserAccomplishmentsServiceFactory',
        'GroupAccomplishmentsServiceFactory'
    ];

    function context(
        EventsService,
        UserDocumentsServiceFactory,
        GroupDocumentsServiceFactory,
        UserAccomplishmentsServiceFactory,
        GroupAccomplishmentsServiceFactory
    ) {

        let researchEntity, documentService, accomplishmentService;

        const service = {
            setResearchEntity: setResearchEntity,
            getResearchEntity: getResearchEntity,
            reset: reset,
            getDocumentService: getDocumentService,
            getAccomplishmentService: getAccomplishmentService
        };

        EventsService.subscribe(service, EventsService.AUTH_LOGIN, (e, re) => setResearchEntity(re));
        EventsService.subscribe(service, EventsService.AUTH_LOGOUT, () =>  reset());

        return service;

        function getResearchEntity(){
            return researchEntity;
        }

        function setResearchEntity(re){
            researchEntity = re;
            if (researchEntity.getType() === 'user') {
                documentService = UserDocumentsServiceFactory.create(researchEntity);
                accomplishmentService = UserAccomplishmentsServiceFactory.create(researchEntity);
            } else {
                documentService = GroupDocumentsServiceFactory.create(researchEntity);
                accomplishmentService = GroupAccomplishmentsServiceFactory.create(researchEntity);
            }

            EventsService.publish(EventsService.CONTEXT_CHANGE);
        }

        function reset( ) {
            researchEntity = null;
            documentService = null;
        }

        function getDocumentService() {
            return documentService;
        }

        function getAccomplishmentService() {
            return accomplishmentService;
        }
    }
}());