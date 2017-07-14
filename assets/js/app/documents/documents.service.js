(function () {
    "use strict";

    angular.module("documents").factory("DocumentsServiceFactory", DocumentsServiceFactory);

    DocumentsServiceFactory.$inject = [
        'Notification',
        'researchEntityService',
        'ModalService',
        'EventsService',
        'DocumentLabels',
        'DocumentKinds',
        '$q'
    ];

    function DocumentsServiceFactory(Notification, researchEntityService, ModalService, EventsService, DocumentLabels, DocumentKinds, $q) {
        return {
            create: function (researchEntity, reService) {
                var service = {};

                service.unverifyDocument = unverifyDocument;
                service.deleteDraft = deleteDraft;
                service.deleteDrafts = deleteDrafts;
                service.verifyDrafts = verifyDrafts;
                service.openEditPopup = openEditPopup;
                service.openDocumentAffiliationForm = openDocumentAffiliationForm;
                service.discardDocument = discardDocument;
                service.verifyDocuments = verifyDocuments;
                service.discardDocuments = discardDocuments;
                service.copyDocument = copyDocument;
                service.copyDocuments = copyDocuments;
                service.copyUncopiedDocuments = copyUncopiedDocuments;
                service.getExternalDocuments = _.partialRight(getExternalDocuments, reService);
                service.synchronizeDraft = synchronizeDraft;
                service.desynchronizeDrafts = desynchronizeDrafts;

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
                                return !d.error && d.kind !== DocumentKinds.DRAFT;
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
                    document.addLabel(DocumentLabels.UVERIFYING);
                    ModalService
                        .multipleChoiceConfirm('Unverifying',
                            'Unverifying a document removes it from your profile, you can choose:\n\n' +
                            'Edit: to move the document in your drafts.\n' +
                            'Remove: to remove it completely from your profile.',
                            ['Edit', 'Remove'])
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
                                    researchEntityService.unverify(researchEntity, document)
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
                            document.removeLabel(DocumentLabels.UVERIFYING);
                        });
                }

                function copyDocument(document) {
                    researchEntityService
                        .copyDocument(researchEntity, document)
                        .then(function (draft) {
                            Notification.success('Document copied');
                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                            document.addLabel(DocumentLabels.DUPLICATE);
                            openEditPopup(draft);
                        });
                }

                function copyUncopiedDocuments(documents) {
                    var notCopiedCocuments = documents.filter(function (d) {
                        return !d.hasLabel(DocumentLabels.DUPLICATE);
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
                                d.addLabel(DocumentLabels.DUPLICATE);
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

                function synchronizeDraft(document, sync) {
                    return researchEntity.one('drafts', document.id)
                        .customPUT({synchronized: sync}, 'synchronized')
                        .then(newDocData => {
                            EventsService.publish(EventsService.DRAFT_SYNCHRONIZED, newDocData);
                            return newDocData;
                        });
                }

                function desynchronizeDrafts(documents) {
                    return researchEntity.customPUT({drafts: documents.map(d => d.id)}, 'desynchronize-documents')
                        .then(function (results) {
                            Notification.success(results.length + " document(s) desynchronized");
                            EventsService.publish(EventsService.DRAFT_SYNCHRONIZED, documents);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function openEditPopup(draft) {
                    ModalService
                        .openScientillaDocumentForm(draft.clone(), researchEntity);
                }

                function openDocumentAffiliationForm(draft) {
                    return ModalService
                        .openDocumentAffiliationForm(draft.clone())
                        .then(i => {
                            if (i === 1) {
                                EventsService.publish(EventsService.DRAFT_UPDATED, draft);
                                Notification.success("Affiliations has been updated");
                            }
                        });
                }

                function getExternalDocuments(query, service) {
                    const connector = query.where.origin;
                    if (!connector)
                        return $q.resolve([]);

                    const fields = {
                        'scopus': 'scopusId',
                        'publications': 'username',
                        'orcid': 'orcidId'
                    };

                    return service
                        .getProfile(researchEntity.id)
                        .then(function (resEntity) {
                            if (!resEntity[fields[query.where.origin]]) {
                                const msg = "Warning<br>" + fields[query.where.origin] + " empty<br>update your profile";
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
