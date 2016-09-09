(function () {

    angular.module("references").factory("DocumentsServiceFactory", DocumentsServiceFactory);

    DocumentsServiceFactory.$inject = [
        '$rootScope',
        'Notification',
        'researchEntityService',
        'ModalService'
    ];

    function DocumentsServiceFactory($rootScope, Notification, researchEntityService, ModalService) {
        return {create: function (researchEntity) {
                var service = {};

                service.unverifyDocument = unverifyDocument;
                service.deleteDraft = deleteDraft;
                service.deleteDrafts = deleteDrafts;
                service.verifyDraft = verifyDraft;
                service.verifyDrafts = verifyDrafts;
                service.openEditPopup = openEditPopup;
                service.verifyDocument = verifyDocument;
                service.discardDocument = discardDocument;
                service.verifyDocuments = verifyDocuments;
                service.discardDocuments = discardDocuments;
                service.copyDocument = copyDocument;
                service.copyDocuments = copyDocuments;

                return service;

                function deleteDrafts(drafts) {
                    var draftIds = _.map(drafts, 'id');
                    researchEntityService
                            .deleteDrafts(researchEntity, draftIds)
                            .then(function (results) {
                                Notification.success(results.length + " draft(s) deleted");
                                $rootScope.$broadcast("draft.deleted", results);
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
                                $rootScope.$broadcast("draft.deleted", d);
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
                                $rootScope.$broadcast("draft.verified", documents);
                            })
                            .catch(function (err) {
                                $rootScope.$broadcast("draft.verified", []);
                                Notification.warning("An error happened");
                            });
                }

                function verifyDraft(draft) {
                    return researchEntityService.verifyDraft(researchEntity, draft)
                            .then(function (document) {
                                if (document.draft) {
                                    Notification.warning("Draft is not valid and cannot be verified");
                                }
                                else {
                                    Notification.success("Draft verified");
                                    $rootScope.$broadcast("draft.verified", document);
                                }
                            })
                            .catch(function () {
                                Notification.warning("Failed to verify draft");
                            });

                }

                function unverifyDocument(document) {
                    document.tags.push('unverifying')
                    ModalService
                            .multipleChoiceConfirm('Unverifying', 'Do you want to unverify the document?', ['Create New Version', 'Unverify'])
                            .then(function (buttonIndex) {

                                researchEntityService.unverify(researchEntity, document)
                                        .then(function (draft) {
                                            delete draft.id;
                                            $rootScope.$broadcast('draft.unverified', {});
                                            switch (buttonIndex) {
                                                case 0:
                                                    researchEntityService
                                                            .copyDocument(researchEntity, draft)
                                                            .then(function (draft) {
                                                                $rootScope.$broadcast("draft.created", draft);
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
                            .then(function (draft) {
                                Notification.success('Document copied');
                                $rootScope.$broadcast("draft.created", draft);
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
                                $rootScope.$broadcast("draft.created", drafts);
                            })
                            .catch(function (err) {
                                Notification.warning("An error happened");
                            });
                }

                function verifyDocument(document) {
                    //sTODO move to a service
                    researchEntityService
                            .verifyDocument(researchEntity, document.id)
                            .then(function () {
                                Notification.success('Document verified');
                                $rootScope.$broadcast("notification.accepted", document);
                            })
                            .catch(function () {
                                Notification.warning('Failed to verify document');
                            });
                }

                function verifyDocuments(documents) {
                    var documentIds = _.map(documents, 'id');
                    researchEntityService
                            .verifyDocuments(researchEntity, documentIds)
                            .then(function (allDocs) {
                                Notification.success(allDocs.length + " document(s) verified");
                                $rootScope.$broadcast("notification.accepted", documents);
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
                                $rootScope.$broadcast("notification.discarded", document);
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
                                $rootScope.$broadcast("notification.discarded", documents);
                            })
                            .catch(function (err) {
                                Notification.warning("An error happened");
                            });
                }

                function openEditPopup(draft) {
                    ModalService
                            .openScientillaDocumentForm(draft.clone(), researchEntity);
                }
            }
        };
    }
}());
