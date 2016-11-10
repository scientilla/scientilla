(function () {

    angular.module("references").factory("DocumentsServiceFactory", DocumentsServiceFactory);

    DocumentsServiceFactory.$inject = [
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'UsersService',
        'GroupsService',
        '$q'
    ];

    function DocumentsServiceFactory(Notification, researchEntityService, ModalService, EventsService, UsersService, GroupsService, $q) {
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
                            var partitions = _.partition(allDocs, 'draft');
                            var drafts = partitions[0];
                            var documents = partitions[1];
                            if (documents.length)
                                Notification.success(documents.length + " draft(s) verified");
                            if (drafts.length)
                                Notification.warning(drafts.length + " is/are not valid and cannot be verified");

                            EventsService.publish(EventsService.DRAFT_VERIFIED, documents);
                        })
                        .catch(function (err) {
                            EventsService.publish(EventsService.DRAFT_VERIFIED, []);
                            Notification.warning("An error happened");
                        });
                }

                function unverifyDocument(document) {
                    document.tags.push('unverifying');
                    ModalService
                        .multipleChoiceConfirm('Unverifying', 'Do you want to unverify the document?', ['Create New Version', 'Unverify'])
                        .then(function (buttonIndex) {

                            researchEntityService.unverify(researchEntity, document)
                                .then(function (draft) {
                                    delete draft.id;
                                    EventsService.publish(EventsService.DRAFT_UNVERIFIED, {});
                                    switch (buttonIndex) {
                                        case 0:
                                            researchEntityService
                                                .copyDocument(researchEntity, draft)
                                                .then(function (draft) {
                                                    EventsService.publish(EventsService.DRAFT_CREATED, draft);
                                                    return draft;
                                                })
                                                .then(openEditPopup);
                                            break;
                                        case 1:
                                            Notification.success("Document succesfully unverified");
                                            break;
                                    }

                                })
                                .catch(function () {
                                    Notification.warning("Failed to unverify document");
                                });

                        })
                        .catch(function () {
                            _.remove(document.tags, function (t) {
                                return t === 'unverifying';
                            });
                        });
                }

                function copyDocument(document) {
                    researchEntityService
                        .copyDocument(researchEntity, document)
                        .then(function(draft) {
                            return researchEntityService.getDraft(researchEntity, draft.id);
                        })
                        .then(function (draft) {
                            Notification.success('Document copied');
                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                            document.addTag('copied');
                            openEditPopup(draft);
                        });
                }

                function copyDocuments(documents) {
                    var notCopiedCocuments = documents.filter(function (d) {
                        return !d.tags.includes('copied');
                    });
                    if (notCopiedCocuments.length === 0) {
                        Notification.success("No documents to copy");
                        return;
                    }
                    researchEntityService
                        .copyDocuments(researchEntity, notCopiedCocuments)
                        .then(function (drafts) {
                            Notification.success(drafts.length + " draft(s) created");
                            documents.forEach(function (d) {
                                d.addTag('copied');
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
                            Notification.success(allDocs.length + " document(s) verified");
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
