(function () {

    angular.module("references").factory("GroupDocumentsServiceFactory", GroupDocumentsServiceFactory);

    GroupDocumentsServiceFactory.$inject = [
        'DocumentsServiceFactory',
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'GroupsService',
        '$q'
    ];

    function GroupDocumentsServiceFactory(DocumentsServiceFactory, Notification, researchEntityService, ModalService, EventsService, GroupsService, $q) {
        return {
            create: function (researchEntity) {
                var service = DocumentsServiceFactory.create(researchEntity, GroupsService);

                service.verifyDraft = verifyDraft;
                service.verifyDocument = verifyDocument;

                return service;

                function verifyDraft(draft) {
                    return researchEntityService.verifyDraftAsGroup(researchEntity, draft.id)
                        .then(function (document) {
                            if (document.draft) {
                                Notification.warning("Draft is not valid and cannot be verified");
                            }
                            else {
                                Notification.success("Draft verified");
                                EventsService.publish(EventsService.DRAFT_VERIFIED, document);
                            }
                        })
                        .catch(function () {
                            Notification.warning("Failed to verify draft");
                        });
                }

                function verifyDocument(document) {
                    researchEntityService
                        .verifyDocument(researchEntity, document.id)
                        .then(function () {
                            Notification.success('Document verified');
                            EventsService.publish(EventsService.DOCUMENT_VERIFIED, document);
                            EventsService.publish(EventsService.NOTIFICATION_ACCEPTED, document);
                        })
                        .catch(function () {
                            Notification.warning('Failed to verify document');
                        });
                }

            }
        };
    }
}());
