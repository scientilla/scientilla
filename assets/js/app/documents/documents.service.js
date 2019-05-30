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
        '$q',
        '$http',
        'documentActions',
        'documentCategories'
    ];

    function DocumentsServiceFactory(Notification, researchEntityService, ModalService, EventsService, DocumentLabels, DocumentKinds, $q, $http, documentActions, documentCategories) {
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
                service.exportDocuments = exportDocuments;
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
                        ['Proceed'],
                        'Cancel',
                        true)
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

                /* jshint ignore:start */
                async function unverifyDocument(document) {
                    document.addLabel(DocumentLabels.UNVERIFYING);
                    const unverifyAction = await ModalService.multipleChoiceConfirm(
                        'Unverifying',
                        'Unverifying a document removes it from your profile, you can choose:\n\n' +
                        'Move to drafts: to move the document in your drafts.\n' +
                        'Remove: to remove it completely from your profile.',
                        ['Move to drafts', 'Remove'],
                        'Cancel',
                        true
                    );

                    switch (unverifyAction) {
                        case -1:
                            document.removeLabel(DocumentLabels.UNVERIFYING);
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

                    document.removeLabel(DocumentLabels.UNVERIFYING);
                }
                /* jshint ignore:end */

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

                function exportDocuments(documents, format) {
                    const filename = format === 'csv' ? 'Export.csv' : 'Export.bib';
                    $http.post('/api/v1/documents/export', {
                        format: format,
                        documentIds: documents.map(d => d.id)
                    }).then((res) => {
                        const element = document.createElement('a');
                        element.setAttribute('href', encodeURI(res.data));
                        element.setAttribute('download', filename);

                        element.style.display = 'none';
                        document.body.appendChild(element);

                        element.click();

                        document.body.removeChild(element);
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
                        'orcid': 'orcidId'
                    };

                    return service
                        .getProfile(researchEntity.id)
                        .then(function (resEntity) {
                            if (resEntity.getType() === 'user' && fields[query.where.origin] && !resEntity[fields[query.where.origin]]) {
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
                        .catch(() => {
                            authorship.public = !authorship.public;
                            Notification.warning('Failed to update privacy');
                        });
                }

                function setAuthorshipFavorite(authorship) {
                    researchEntityService
                        .setAuthorshipFavorite(researchEntity, authorship)
                        .then(() => {
                            Notification.success('Favorite updated');
                            EventsService.publish(EventsService.DOCUMENT_AUTORSHIP_FAVORITE_UPDATED, document);
                        })
                        .catch(() => {
                            authorship.favorite = !authorship.favorite;
                            Notification.warning('Failed to update favorite');
                        });
                }

                /* jshint ignore:start */
                async function markAsNotDuplicates(document, duplicates) {
                    const duplicateIds = duplicates.map((duplicate) => {
                        return duplicate.duplicate;
                    });
                    return await researchEntityService.markAsNotDuplicates(researchEntity, document.id, duplicateIds);
                }

                /**
                 * This asynchronous function handles to keep the source document
                 *
                 * @param {Object} sourceDocument - The document that will be kept
                 * @param {string} category - The category of the source document
                 *
                 * @retuns {Object} Returns an object with the response and potential errors
                 */
                async function handleKeepDocument(sourceDocument, category) {
                    let response,
                        action = false,
                        buttonLabels;

                    // Check the category of the source document
                    switch(category) {

                        // If the source document is a suggested document
                        case documentCategories.SUGGESTED:
                            buttonLabels = [];
                            buttonLabels['\'' + documentActions.SUGGESTED.VERIFY + '\''] = documentActions.SUGGESTED.VERIFY;
                            buttonLabels['\'' + documentActions.SUGGESTED.COPY_TO_DRAFT + '\''] = documentActions.SUGGESTED.COPY_TO_DRAFT;

                            // Show modal with multiple choice form with the options specified above
                            action = await ModalService.multipleChoiceConfirm(
                                'Suggested document selected',
                                'Do you want to verify the suggested document or copy it to drafts?',
                                buttonLabels
                            );

                            // Check to chosen action
                            switch(action) {
                                case documentActions.SUGGESTED.VERIFY:
                                    // Verify the source document
                                    response = await verify(sourceDocument);
                                    break;

                                case documentActions.SUGGESTED.COPY_TO_DRAFT:
                                    // Copy the suggested document
                                    researchEntityService.copyDocument(researchEntity, sourceDocument)
                                        .then(function (draft) {
                                            EventsService.publish(EventsService.DRAFT_CREATED, draft);
                                        });
                                    break;

                                default:
                                    break;
                            }

                            break;

                        // If the source document is a draft
                        case documentCategories.DRAFT:
                            buttonLabels = [];
                            buttonLabels['\'' + documentActions.DRAFT.VERIFY + '\''] = documentActions.DRAFT.VERIFY;
                            buttonLabels['\'' + documentActions.DRAFT.KEEP_DRAFT + '\''] = documentActions.DRAFT.KEEP_DRAFT;

                            // Show modal with multiple choice form with the options specified above
                            action = await ModalService.multipleChoiceConfirm(
                                'Draft selected',
                                'Do you want to verify the draft or keep it as a draft?',
                                buttonLabels
                            );

                            // Verify the source document
                            if (action === documentActions.DRAFT.VERIFY) {
                                response = await verify(sourceDocument);
                            }
                            break;

                        // If the source document is a verified document
                        case documentCategories.VERIFIED:
                            action = documentActions.KEEP.KEEP_VERIFIED_DOCUMENT;
                            break;
                        default:
                            break;
                    }

                    return {
                        action: action,
                        response: response
                    };
                }

                /**
                 * This asynchronous function handles the replacement of the similar document by the source document
                 *
                 * @param {Object} sourceDocument - The document that will replace the similar document
                 * @param {Object} similarDocument - The document that will be replaced by the source document
                 * @param {string} category - The category of the source document
                 *
                 * @returns {Object} Returns an object with the response and potential errors
                 */
                async function handleReplaceDocument(sourceDocument, similarDocument, category) {
                    let response,
                        action = false;

                    // Check the category of the source document
                    switch(category) {

                        // If the source document is a suggested document
                        case documentCategories.SUGGESTED:
                            // Set the action with the related constant
                            action = documentActions.REPLACE.UNVERIFY_DOCUMENT_AND_VERIFY;

                            // Unverify the similar document & verify the source document
                            response = await service.removeVerify(sourceDocument, similarDocument);

                            if (response.error) {
                                Notification.warning(response.error);
                            }
                            break;

                        // If the source document is a draft
                        case documentCategories.DRAFT :
                            // Set the action with the related constant
                            action = documentActions.REPLACE.UNVERIFY_DOCUMENT_AND_VERIFY_DRAFT;

                            // Unverify the similar document & verify the source document
                            response = await service.removeVerify(sourceDocument, similarDocument);

                            if (response.error) {
                                Notification.warning(response.error);
                            }
                            break;

                        // If the source document is a verified document
                        case documentCategories.VERIFIED:
                            // Set the action with the related constant
                            action = documentActions.REPLACE.UNVERIFY_DOCUMENT_AND_REPLACE;

                            // Copy not duplicates of the similar documents to the source document
                            response = await markAsNotDuplicates(sourceDocument, similarDocument.notDuplicates);

                            // Unverify the similar document
                            response = await researchEntityService.unverify(researchEntity, similarDocument);
                            break;

                        // If the source document is a external document
                        case documentCategories.EXTERNAL:
                            // Set the action with the related constant
                            action = documentActions.REPLACE.COPY_EXTERNAL_DOCUMENT_AND_VERIFY;

                            // Unverify the similar document & verify the source document
                            response = await service.removeVerify(sourceDocument, similarDocument);

                            if (response.error) {
                                Notification.warning(response.error);
                            }
                            break;
                        default:
                            break;
                    }

                    return {
                        action: action,
                        response: response
                    };
                }

                /**
                 * This asynchronous function handles the comparison between a source document and similar documents
                 * for that source document
                 *
                 * @param {Object} sourceDocument - The document selected from the listing
                 * @param {Object[]} similarDocuments - An array with similar documents of the source document
                 * @param {string} category - The category of the source document
                 */
                async function compareDocuments(sourceDocument, similarDocuments, category) {

                    let result = false,
                        duplicateIds,
                        compareAction = {};

                    // Get all the duplicates
                    await Promise.all(similarDocuments.map(async (info, index) => {
                        similarDocuments[index] = await researchEntityService.getDoc(researchEntity, info.duplicate, info.duplicateKind);
                    }));

                    // Open the compare modal
                    try {
                        compareAction = await ModalService.openDocumentComparisonForm(sourceDocument, similarDocuments, category);
                    } catch(e) {
                        if (e !== 'backdrop click' && e !== 'escape key press') {
                            //console.log(e);
                        }
                    }

                    // Check the compare action that the user has chosen
                    switch(compareAction.option) {

                        // The user wants to keep the source document and mark all the other similar documents as not duplicates
                        case documentActions.COMPARE.KEEP_DOCUMENT:

                            // Collect all the id's of the similar documents
                            duplicateIds = similarDocuments.map((similarDocument) => {
                                return similarDocument.id;
                            });

                            // Mark as not duplicates
                            await researchEntityService.markAsNotDuplicates(researchEntity, sourceDocument.id, duplicateIds);

                            result = await handleKeepDocument(sourceDocument, category);
                            break;

                        // Mark all the similar documents as not duplicate in the external section
                        case documentActions.COMPARE.MARK_ALL_AS_NOT_DUPLICATE:

                            // Collect all the id's of the similar documents
                            duplicateIds = similarDocuments.map((similarDocument) => {
                                return similarDocument.id;
                            });

                            // Mark as not duplicates
                            await researchEntityService.markAsNotDuplicates(researchEntity, sourceDocument.id, duplicateIds);

                            // Set the result action
                            result = {
                                action:  documentActions.COMPARE.MARK_ALL_AS_NOT_DUPLICATE
                            };
                            break;

                        // Delete the draft
                        case documentActions.COMPARE.DELETE_DRAFT:
                            result = deleteDraft(sourceDocument);
                            break;

                        // Unverify the verified document
                        case documentActions.COMPARE.UNVERIFY_VERIFIED_DOCUMENT:
                            result = unverifyDocument(sourceDocument);
                            break;

                        // Discard the suggested document
                        case documentActions.COMPARE.DISCARD_SUGGESTED_DOCUMENT:

                            // Discard document
                            discardDocument(sourceDocument);

                            result = {
                                action: documentActions.COMPARE.DISCARD_SUGGESTED_DOCUMENT
                            };
                            break;

                        // Replace the similar document with the source document
                        case documentActions.COMPARE.USE_DUPLICATE:
                            result = await handleReplaceDocument(sourceDocument, compareAction.duplicate, category);
                            break;
                        default:
                            break;
                    }

                    // Check if the result has an action
                    if (result.action) {

                        // Fire event to update the document list
                        EventsService.publish(EventsService.DOCUMENT_COMPARE, sourceDocument);

                        // Show notification with warning or success message
                        if (result.response) {
                            if (result.response.error) {
                                const notificationMsg = 'The operation failed.';
                                Notification.warning(notificationMsg);
                            } else {
                                const notificationMsg = 'The operation was successful';
                                Notification.success(notificationMsg);
                            }
                        }
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
