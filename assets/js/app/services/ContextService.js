(function () {
    angular.module("services").factory("context", controller);

    controller.$inject = [
        'EventsService',
        'ResearchEntitiesService',
        'UsersService',
        'GroupsService',
        'UserDocumentsServiceFactory',
        'GroupDocumentsServiceFactory'
    ];

    function controller(EventsService, ResearchEntitiesService, UsersService, GroupsService, UserDocumentsServiceFactory, GroupDocumentsServiceFactory) {

        let subResearchEntity, researchEntityId, researchEntity, documentService;

        const service = {
            getResearchEntity: getResearchEntity,
            setSubResearchEntity: setSubResearchEntity,
            getSubResearchEntity: getSubResearchEntity,
            refreshSubResearchEntity: refreshSubResearchEntity,
            reset: reset,
            getDocumentService: getDocumentService
        };

        EventsService.subscribe(service, EventsService.AUTH_LOGIN, (e, re) => setSubResearchEntity(re));
        EventsService.subscribe(service, EventsService.AUTH_LOGOUT, () => reset());

        return service;

        /* jshint ignore:start */
        async function getResearchEntity() {
            if (!researchEntity || researchEntityId !== researchEntity.id)
                researchEntity = await ResearchEntitiesService.getResearchEntity(researchEntityId);

            return researchEntity;
        }

        async function refreshSubResearchEntity() {
            if (subResearchEntity.getType() === 'user')
                subResearchEntity = await UsersService.getProfile(subResearchEntity.id);
            else
                subResearchEntity = await GroupsService.getProfile(subResearchEntity.id);
        }

        /* jshint ignore:end */

        function getSubResearchEntity() {
            return subResearchEntity;
        }

        function setSubResearchEntity(sre) {
            subResearchEntity = sre;
            researchEntityId = _.isObject(subResearchEntity.researchEntity) ? subResearchEntity.researchEntity.id : subResearchEntity.researchEntity;
            if (subResearchEntity.getType() === 'user')
                documentService = UserDocumentsServiceFactory.create(subResearchEntity);
            else
                documentService = GroupDocumentsServiceFactory.create(subResearchEntity);


            EventsService.publish(EventsService.CONTEXT_CHANGE);
        }

        function reset() {
            researchEntity = undefined;
            researchEntityId = undefined;
            subResearchEntity = undefined;
            documentService = undefined;
        }

        function getDocumentService() {
            return documentService;
        }
    }
}());