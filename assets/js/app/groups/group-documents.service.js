(function () {

    angular.module("documents").factory("GroupDocumentsServiceFactory", GroupDocumentsServiceFactory);

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
                service.synchronizeDraft = synchronizeDraft;
                service.removeVerify = removeVerify;

                return service;

                function verifyDraft(draft, notifications = true) {
                    return researchEntityService.verifyDraftAsGroup(researchEntity, draft.id)
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

                function verifyDocument(document, notifications = true) {
                    researchEntityService
                        .verifyDocument(researchEntity, document.id)
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

                function synchronizeDraft(document, sync) {
                    let msg, title;
                    if (sync) {
                        title = 'Synchronize with scopus';
                        msg = 'This action will synchronize your document and keep it consistent with the Scopus version.\n' +
                            'To edit the document disable the synchronization.\n\n' +
                            'WARNING! It may overwrite the current data.';
                    }
                    else {
                        title = 'Disable synchronization';
                        msg = 'This action will disable the synchronization with scopus.';
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
                    const verificationData = {};
                    const res = await researchEntityService.removeVerify(researchEntity, docToVerify.id, verificationData, docToRemove.id)
                    return res;
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
