(function () {

    angular.module("documents").factory("UserDocumentsServiceFactory", UserDocumentsServiceFactory);

    UserDocumentsServiceFactory.$inject = [
        'DocumentsServiceFactory',
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'UsersService',
        '$q'
    ];

    function UserDocumentsServiceFactory(DocumentsServiceFactory, Notification, researchEntityService, ModalService, EventsService, UsersService, $q) {
        return {
            create: function (researchEntity) {
                var service = DocumentsServiceFactory.create(researchEntity, UsersService);

                service.verifyDraft = verifyDraft;
                service.verifyDocument = verifyDocument;

                return service;

                function verifyDraft(draft) {
                    function verificationCallback(user, documentId, verificationData) {
                        return researchEntityService.verifyDraftAsUser(user, documentId, verificationData)
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

                    return ModalService.openDocumentVerificationForm(draft, verificationCallback);

                }

                function verifyDocument(document) {
                    function verificationCallback(user, documentId, verificationData) {
                        return researchEntityService.verifyDocument(user, documentId, verificationData)
                            .then(function () {
                                Notification.success('Document verified');
                                EventsService.publish(EventsService.DOCUMENT_VERIFIED, document);
                                EventsService.publish(EventsService.NOTIFICATION_ACCEPTED, document);
                            })
                            .catch(function () {
                                Notification.warning('Failed to verify document');
                            });
                    }

                    return ModalService.openDocumentVerificationForm(document, verificationCallback);
                }
            }
        };
    }
}());
