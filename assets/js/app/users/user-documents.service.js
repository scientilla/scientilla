(function () {

    angular.module("documents").factory("UserDocumentsServiceFactory", UserDocumentsServiceFactory);

    UserDocumentsServiceFactory.$inject = [
        'DocumentsServiceFactory',
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'UsersService',
        'documentCategories',
        '$q'
    ];

    function UserDocumentsServiceFactory(DocumentsServiceFactory, Notification, researchEntityService, ModalService, EventsService, UsersService, documentCategories, $q) {
        return {
            create: function (researchEntity) {
                var service = DocumentsServiceFactory.create(researchEntity, UsersService);

                service.verifyDraft = verifyDraft;
                service.verifyDocument = verifyDocument;
                service.synchronizeDraft = synchronizeDraft;
                service.verify = verify;
                service.removeVerify = removeVerify;
                service.markAsNotDuplicates = markAsNotDuplicates;

                return service;

                function verify(d) {
                    if (d.isDraft())
                        verifyDraft(d);
                    else
                        verifyDocument(d);
                }

                /* jshint ignore:start */
                async function verifyDraft(draft, notifications = true) {

                    async function verificationCallback(user, documentId, verificationData) {
                        try {
                            const res = await researchEntityService.verifyDraftAsUser(user, documentId, verificationData);

                            if (res.error) {

                                try {
                                    const document = await researchEntityService.getDraft(user, documentId);
                                    service.compareDocuments(document, document.getComparisonDuplicates(), documentCategories.DRAFT);
                                } catch (error) {
                                    Notification.error(error);
                                }

                                Notification.warning(res.error);
                                return;
                            }

                            if (notifications)
                                Notification.success("Draft verified");

                            EventsService.publish(EventsService.DRAFT_VERIFIED, res);

                        } catch (error) {
                            Notification.warning(error);
                        }

                    }

                    const d = await researchEntityService.getDraft(researchEntity, draft.id);
                    return ModalService.openDocumentVerificationForm(d, verificationCallback);
                }

                /* jshint ignore:end */

                /* jshint ignore:start */
                async function verifyDocument(document, notifications = true) {
                    async function verificationCallback(user, documentId, verificationData) {
                        try {
                            const res = await researchEntityService.verifyDocument(user, documentId, verificationData);

                            if (res.error) {
                                Notification.warning(res.error);
                                return;
                            }

                            if (notifications)
                                Notification.success('Document verified');
                            EventsService.publish(EventsService.DOCUMENT_VERIFIED, document);
                            EventsService.publish(EventsService.NOTIFICATION_ACCEPTED, document);

                        } catch (error) {
                            Notification.warning(error);
                        }
                    }

                    return ModalService.openDocumentVerificationForm(document, verificationCallback);
                }

                /* jshint ignore:end */

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

                /* jshint ignore:start */
                async function removeVerify(docToVerify, docToRemove) {
                    async function verificationCallback(researchEntity, docToVerifyId, verificationData, docToRemoveId) {
                        return await researchEntityService.removeVerify(researchEntity, docToVerifyId, verificationData, docToRemoveId);
                    }

                    return await ModalService.openDocumentVerificationForm(docToVerify, verificationCallback, docToRemove);
                }
                /* jshint ignore:end */

                /* jshint ignore:start */
                async function markAsNotDuplicates(researchEntity, documentId, duplicateIds) {
                    return await researchEntityService.markAsNotDuplicates(researchEntity, documentId, duplicateIds);
                }
                /* jshint ignore:end */
            }
        };
    }
}());
