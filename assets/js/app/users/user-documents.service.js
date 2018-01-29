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
                service.synchronizeDraft = synchronizeDraft;
                service.verify = verify;

                return service;

                function verify(d) {
                    if (d.isDraft())
                        verifyDraft(d);
                    else
                        verifyDocument(d);
                }

                function verifyDraft(draft, notifications = true) {
                    function verificationCallback(user, documentId, verificationData) {
                        return researchEntityService.verifyDraftAsUser(user, documentId, verificationData)
                            .then(function (res) {
                                if (res.error)
                                    throw res.error;

                                if (notifications)
                                    Notification.success("Draft verified");
                                EventsService.publish(EventsService.DRAFT_VERIFIED, res);

                            })
                            .catch(function (error) {
                                Notification.warning(error);
                            });
                    }

                    return ModalService.openDocumentVerificationForm(draft, verificationCallback);

                }

                function verifyDocument(document, notifications = true) {
                    function verificationCallback(user, documentId, verificationData) {
                        return researchEntityService.verifyDocument(user, documentId, verificationData)
                            .then(function (res) {
                                if (res.error)
                                    throw res.error;

                                if (notifications)
                                    Notification.success('Document verified');
                                EventsService.publish(EventsService.DOCUMENT_VERIFIED, document);
                                EventsService.publish(EventsService.NOTIFICATION_ACCEPTED, document);

                            })
                            .catch(function (error) {
                                Notification.warning(error);
                            });
                    }

                    return ModalService.openDocumentVerificationForm(document, verificationCallback);
                }

                function synchronizeDraft(document, sync) {
                    let msg, title;
                    if (sync) {
                        title = 'Synchronize with scopus';
                        msg = 'This action will synchronize your document and keep it consistent with the Scopus version.\n' +
                            'To edit the document disable the synchronization.\n' +
                            'You can edit your affiliation during the document verification process without disabling the\n' +
                            'synchronization.\n\n' +
                            'WARNING! It may overwrite the current data.';
                    }
                    else {
                        title = 'Disable synchronization';
                        msg = 'This action will disable the synchronization with scopus.\n' +
                            'Remember: you can edit your affiliation during the document verification process without\n' +
                            'disabling the synchronization.';
                    }

                    return ModalService.multipleChoiceConfirm(title, msg, ['Proceed'])
                        .then(res => {
                            if (res === 0)
                                researchEntity.one('drafts', document.id)
                                    .customPUT({synchronized: sync}, 'synchronized')
                                    .then(newDocData => {
                                        EventsService.publish(EventsService.DRAFT_SYNCHRONIZED, newDocData);
                                        if (sync)
                                            Notification.success("Document synchronized");
                                        else
                                            Notification.success("Document desynchronized");
                                    })
                                    .catch(function (err) {
                                        Notification.warning(err.data);
                                    });
                            }
                        )
                        .catch(() => true);
                }
            }
        };
    }
}());
