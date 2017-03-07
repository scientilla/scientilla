(function () {

    angular.module("documents").factory("DocumentsServiceFactory", DocumentsServiceFactory);

    DocumentsServiceFactory.$inject = [
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'ClientTags',
        '$q'
    ];

    function DocumentsServiceFactory(Notification, researchEntityService, ModalService, EventsService, ClientTags, $q) {
        return {
            create: function (researchEntity, reService) {
                var service = {};

                service.unverifyDocument = unverifyDocument;
                service.deleteDraft = deleteDraft;
                service.deleteDrafts = deleteDrafts;
                service.verifyDrafts = verifyDrafts;
                service.openEditPopup = openEditPopup;
                service.discardDocument = discardDocument;
                service.verifyDocuments = verifyDocuments;
                service.discardDocuments = discardDocuments;
                service.copyDocument = copyDocument;
                service.copyDocuments = copyDocuments;
                service.copyUncopiedDocuments = copyUncopiedDocuments;
                service.getExternalDocuments = _.partialRight(getExternalDocuments, reService);

                return service;

                function deleteDrafts(drafts) {
                    var draftIds = _.map(drafts, 'id');
                    researchEntityService
                        .deleteDrafts(researchEntity, draftIds)
                        .then(function (results) {
                            Notification.success(results.length + " draft(s) deleted");
                            EventsService.publish(EventsService.DRAFT_DELETED, results);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function deleteDraft(draft) {
                    researchEntityService
                        .deleteDraft(researchEntity, draft.id)
                        .then(function (d) {
                            Notification.success("Draft deleted");
                            EventsService.publish(EventsService.DRAFT_DELETED, d);
                        })
                        .catch(function () {
                            Notification.warning("Failed to delete draft");
                        });
                }

                function verifyDrafts(drafts) {
                    var draftIds = _.map(drafts, 'id');
                    researchEntityService
                        .verifyDrafts(researchEntity, draftIds)
                        .then(function (allDocs) {

                            function docMapper(doc) {
                                return doc.item;
                            }

                            var part = _.partition(allDocs, function (d) {
                                return !d.error && !d.draft;
                            });
                            var verifiedDrafts = part[0];
                            var unverifiedDrafts = part[1];

                            if (verifiedDrafts.length)
                                Notification.success(verifiedDrafts.length + " draft(s) verified");
                            if (unverifiedDrafts.length)
                                Notification.warning(unverifiedDrafts.length + " draft(s) is/are not valid and cannot be verified");

                            EventsService.publish(EventsService.DRAFT_VERIFIED, verifiedDrafts.map(docMapper));
                        })
                        .catch(function (err) {
                            EventsService.publish(EventsService.DRAFT_VERIFIED, []);
                            Notification.warning("An error happened");
                        });
                }

                function unverifyDocument(document) {
                    document.addTag(ClientTags.UVERIFYING); //.tags.push(ClientTags.UVERIFYING);
                    ModalService
                        .multipleChoiceConfirm('Unverifying', 'Do you want to unverify the document?', ['Create New Version', 'Unverify'])
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case 0:
                                    researchEntityService.unverify(researchEntity, document)
                                        .then(function (draft) {
                                            EventsService.publish(EventsService.DRAFT_UNVERIFIED, {});
                                            return researchEntityService
                                                .copyDocument(researchEntity, document)
                                                .then(function (draft) {
                                                    EventsService.publish(EventsService.DRAFT_CREATED, draft);
                                                    return draft;
                                                })
                                                .then(openEditPopup)
                                                .catch(function () {
                                                    Notification.warning("Failed to unverify document");
                                                });
                                        });
                                    break;
                                case 1:
                                    researchEntityService.discardDocument(researchEntity, document.id)
                                        .then(function (draft) {
                                            EventsService.publish(EventsService.DRAFT_UNVERIFIED, {});
                                            Notification.success("Document succesfully unverified");
                                        })
                                        .catch(function () {
                                            Notification.warning("Failed to unverify document");
                                        });
                                    break;
                            }
                        })
                        .catch(function () {
                            document.removeTag(ClientTags.UVERIFYING);
                        });
                }

                function copyDocument(document) {
                    researchEntityService
                        .copyDocument(researchEntity, document)
                        .then(function (draft) {
                            Notification.success('Document copied');
                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                            document.addTag(ClientTags.DUPLICATE);
                            openEditPopup(draft);
                        });
                }

                function copyUncopiedDocuments(documents) {
                    var notCopiedCocuments = documents.filter(function (d) {
                        return !d.hasTag(ClientTags.DUPLICATE);
                    });
                    return copyDocuments(notCopiedCocuments);
                }

                function copyDocuments(documents) {
                    if (documents.length === 0) {
                        Notification.success("No documents to copy");
                        return;
                    }
                    researchEntityService
                        .copyDocuments(researchEntity, documents)
                        .then(function (drafts) {
                            Notification.success(drafts.length + " draft(s) created");
                            documents.forEach(function (d) {
                                d.addTag(ClientTags.DUPLICATE);
                            });
                            EventsService.publish(EventsService.DRAFT_CREATED, drafts);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function verifyDocuments(documents) {
                    var documentIds = _.map(documents, 'id');
                    researchEntityService
                        .verifyDocuments(researchEntity, documentIds)
                        .then(function (allDocs) {

                            function docMapper(doc) {
                                return doc.item;
                            }

                            var part = _.partition(allDocs, function (d) {
                                return !d.error;
                            });
                            var verifiedDocs = part[0];
                            var unverifiedDocs = part[1];
                            if (verifiedDocs.length)
                                Notification.success(verifiedDocs.length + " document(s) verified");
                            if (unverifiedDocs.length)
                                Notification.warning(unverifiedDocs.length + " document(s) not verified");
                            EventsService.publish(EventsService.DOCUMENT_VERIFIED, verifiedDocs.map(docMapper));
                            EventsService.publish(EventsService.NOTIFICATION_ACCEPTED, documents);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function discardDocument(document) {
                    researchEntityService
                        .discardDocument(researchEntity, document.id)
                        .then(function () {
                            Notification.success('Document discarded');
                            EventsService.publish(EventsService.NOTIFICATION_DISCARDED, document);
                        })
                        .catch(function () {
                            Notification.warning('Failed to discard document');
                        });
                }

                function discardDocuments(documents) {
                    var documentIds = _.map(documents, 'id');
                    researchEntityService
                        .discardDocuments(researchEntity, documentIds)
                        .then(function (results) {
                            var resultPartitioned = _.partition(results, function (o) {
                                return o;
                            });
                            Notification.success(resultPartitioned[0].length + " document(s) discarded");
                            EventsService.publish(EventsService.NOTIFICATION_DISCARDED, documents);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function openEditPopup(draft) {
                    ModalService
                        .openScientillaDocumentForm(draft.clone(), researchEntity);
                }

                function getExternalDocuments(query, service) {
                    var connector = query.where.connector;
                    if (!connector)
                        return $q.resolve([]);

                    return service
                        .getProfile(researchEntity.id)
                        .then(function (resEntity) {

                            if (!resEntity[query.where.field]) {
                                var msg = "Warning<br>" + query.where.field + " empty<br>update your profile";
                                Notification.warning(msg);
                                throw msg;
                            }

                            return researchEntityService.getExternalDocuments(researchEntity, query);

                        });
                }
            }
        };
    }
}());
