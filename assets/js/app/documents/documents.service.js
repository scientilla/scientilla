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
                service.openDocumentAuthorsForm = openDocumentAuthorsForm;
                service.discardDocument = discardDocument;
                service.verifyDocuments = verifyDocuments;
                service.discardDocuments = discardDocuments;
                service.createDraft = createDraft;
                service.copyDocument = copyDocument;
                service.copyDocuments = copyDocuments;
                service.copyUncopiedDocuments = copyUncopiedDocuments;
                service.getExternalDocuments = _.partialRight(getExternalDocuments, reService);
                service.desynchronizeDrafts = desynchronizeDrafts;
                service.setAuthorshipFavorite = setAuthorshipFavorite;
                service.setAuthorshipPrivacy = setAuthorshipPrivacy;
                service.compareDocuments = compareDocuments;
                service.verify = verify;

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
                    return ModalService.multipleChoiceConfirm(
                        'Delete',
                        'This action will permanently delete this document.\n Do you want to proceed?',
                        ['Proceed'])
                        .then(res => {
                                if (res === 0)
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
                        ).catch(() => true);
                }

                function verifyDrafts(drafts) {
                    const [verifiableDrafts, unverifiableDrafts] = _.partition(drafts, d => !d.isComparable);
                    var draftIds = _.map(verifiableDrafts, 'id');
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
                            var unverifiedDrafts = unverifiableDrafts.concat(part[1]);

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
                            'Move to drafts: to move the document in your drafts.\n' +
                            'Remove: to remove it completely from your profile.',
                            ['Move to drafts', 'Remove'])
                        .then(function (buttonIndex) {
                            switch (buttonIndex) {
                                case -1:
                                    document.removeLabel(DocumentLabels.UVERIFYING);
                                    break;
                                case 0:
                                    return researchEntityService.copyDocument(researchEntity, document)
                                        .then(function (draft) {
                                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                                            return researchEntityService.unverify(researchEntity, document)
                                                .then(function (draft) {
                                                    EventsService.publish(EventsService.DRAFT_UNVERIFIED, {});
                                                    Notification.success('Document moved to drafts');
                                                    return draft;
                                                })
                                                .catch(() => Notification.warning('Failed to unverify document'));
                                        });
                                case 1:
                                    return researchEntityService.unverify(researchEntity, document)
                                        .then(function (draft) {
                                            EventsService.publish(EventsService.DRAFT_UNVERIFIED, {});
                                            Notification.success("Document succesfully unverified");
                                        })
                                        .catch(function () {
                                            Notification.warning("Failed to unverify document");
                                        });
                            }
                        })
                        .catch(function () {
                            document.removeLabel(DocumentLabels.UVERIFYING);
                        });
                }

                function createDraft(documentData) {
                    return researchEntityService
                        .createDraft(researchEntity, documentData)
                        .then(function (draft) {
                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                            return draft;
                        });
                }

                function copyUncopiedDocuments(documents) {
                    var notCopiedCocuments = documents.filter(function (d) {
                        return !d.hasLabel(DocumentLabels.ALREADY_VERIFIED) && !d.hasLabel(DocumentLabels.ALREADY_IN_DRAFTS);
                    });
                    return copyDocuments(notCopiedCocuments);
                }

                function copyDocuments(documents) {
                    if (documents.length === 0) {
                        Notification.success("No documents to copy");
                        return;
                    }
                    return researchEntityService
                        .copyDocuments(researchEntity, documents)
                        .then(function (drafts) {
                            Notification.success(drafts.length + " draft(s) created");
                            documents.forEach(function (d) {
                                d.addLabel(DocumentLabels.ALREADY_IN_DRAFTS);
                            });
                            EventsService.publish(EventsService.DRAFT_CREATED, drafts);
                        })
                        .catch(function (err) {
                            Notification.warning("An error happened");
                        });
                }

                function copyDocument(document) {
                    return researchEntityService
                        .copyDocument(researchEntity, document)
                        .then(function (draft) {
                            Notification.success('Document copied to drafts');
                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                            document.addLabel(DocumentLabels.ALREADY_IN_DRAFTS);
                        });
                }

                function verifyDocuments(documents) {
                    const [verifiableDocs, unverifiableDocs] = _.partition(documents, d => !d.isComparable);
                    var documentIds = _.map(verifiableDocs, 'id');
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
                            var unverifiedDocs = unverifiableDocs.concat(part[1]);
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

                function desynchronizeDrafts(documents) {
                    return researchEntity.customPUT({drafts: documents.map(d => d.id)}, 'desynchronize-documents')
                        .then(function (results) {
                            Notification.success(results.length + " document(s) desynchronized");
                            EventsService.publish(EventsService.DRAFT_SYNCHRONIZED, documents);
                        })
                        .catch(function (err) {
                            Notification.warning(err.data);
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

                function openDocumentAuthorsForm(draft) {
                    return ModalService
                        .openDocumentAuthorsForm(draft.clone())
                        .then(i => {
                            if (i === 1) {
                                EventsService.publish(EventsService.DRAFT_UPDATED, draft);
                                Notification.success("Authors has been updated");
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
                            if (resEntity.getType() === 'user' && !resEntity[fields[query.where.origin]]) {
                                const msg = "Warning<br>" + fields[query.where.origin] + " empty<br>update your profile";
                                Notification.warning(msg);
                                throw msg;
                            }

                            return researchEntityService.getExternalDocuments(researchEntity, query);

                        });
                }

                function setAuthorshipPrivacy(authorship) {
                    researchEntityService
                        .setAuthorshipPrivacy(researchEntity, authorship)
                        .then(() => {
                            Notification.success('Privacy updated');
                            EventsService.publish(EventsService.DOCUMENT_AUTORSHIP_PRIVACY_UPDATED, document);
                        })
                        .catch(() => Notification.warning('Failed to set privacy'));
                }

                function setAuthorshipFavorite(authorship) {
                    researchEntityService
                        .setAuthorshipFavorite(researchEntity, authorship)
                        .then(() => {
                            Notification.success('Favorite set');
                            EventsService.publish(EventsService.DOCUMENT_AUTORSHIP_FAVORITE_UPDATED, document);
                        })
                        .catch(err => Notification.warning(err.data));
                }

                /* jshint ignore:start */
                async function compareDocuments(doc1, duplicateInfo) {
                    try {
                        const doc2Id = duplicateInfo.duplicate;
                        const doc2 = await researchEntityService.getDoc(researchEntity, doc2Id, duplicateInfo.duplicateKind);
                        const i = await ModalService.openDocumentComparisonForm(doc1, doc2);
                        const d = i === 1 ? 2 : 1;
                        let chosenDoc, discardedDoc;
                        if (i === 1) {
                            chosenDoc = doc1;
                            discardedDoc = doc2;
                        }
                        if (i === 2) {
                            chosenDoc = doc2;
                            discardedDoc = doc1;
                        }
                        if (i === 1 || i === 2) {
                            const modalMsg = `Discarded document (${discardedDoc.getStringKind(researchEntity)}) will be removed.\nWhat do you want to do with selected document (${chosenDoc.getStringKind(researchEntity)})?`;
                            let res, err, j;
                            if (chosenDoc.isSuggested(researchEntity)) {
                                j = await ModalService
                                    .multipleChoiceConfirm('Suggested document selected',
                                        modalMsg,
                                        ['Verify', 'Copy to Draft']);
                                if (j === 0 || j === 1) {
                                    if (j === 0) {
                                        res = await service.removeVerify(chosenDoc, discardedDoc);
                                    }
                                    if (j === 1) {
                                        res = await researchEntityService.removeDocument(researchEntity, discardedDoc);
                                        if (!res.error)
                                            res = await researchEntityService.copyDocument(researchEntity, chosenDoc);
                                    }
                                }
                            }
                            if (chosenDoc.isDraft()) {
                                j = await ModalService
                                    .multipleChoiceConfirm('Draft selected',
                                        modalMsg,
                                        ['Verify', 'Keep Draft']);
                                if (j === 0 || j === 1) {
                                    if (j === 0) {
                                        res = await service.removeVerify(chosenDoc, discardedDoc);
                                    }
                                    if (j === 1) {
                                        res = await researchEntityService.removeDocument(researchEntity, discardedDoc);
                                    }
                                }
                            }
                            if (chosenDoc.isVerified(researchEntity)) {
                                j = await ModalService
                                    .multipleChoiceConfirm('Verified document selected',
                                        modalMsg,
                                        ['Keep verified', 'Create a draft']);
                                if (j === 0 || j === 1) {
                                    res = await researchEntityService.removeDocument(researchEntity, discardedDoc);
                                    if (!res.error && j === 1) {
                                        res = await researchEntityService.copyDocument(researchEntity, chosenDoc);
                                        if (!res.error)
                                            res = await researchEntityService.unverify(researchEntity, chosenDoc);
                                    }
                                }
                            }
                            if (j === 0 || j === 1) {
                                EventsService.publish(EventsService.DOCUMENT_COMPARE, chosenDoc);
                                if (res) {
                                    if (res.error) {
                                        const notificationMsg = 'The operation failed.';
                                        Notification.warning(notificationMsg);
                                    } else {
                                        const notificationMsg = 'The operation was successful';
                                        Notification.success(notificationMsg);
                                    }
                                }
                            }
                        }
                        if (i === 3) {
                            await researchEntityService.documentsNotDuplicate(researchEntity, doc1, doc2);
                            EventsService.publish(EventsService.DOCUMENT_COMPARE, null);
                            Notification.success("The documents have been marked as non-duplicates");
                        }
                    } catch (err) {
                        console.log(err);
                        if (err !== 'backdrop click')
                            Notification.error("An error happened");

                    }
                }

                function verify(d, notifications = true) {
                    if (d.isDraft())
                        return service.verifyDraft(d, notifications);
                    else
                        return service.verifyDocument(d, notifications);
                }

                /* jshint ignore:end */
            }
        };
    }
}());
