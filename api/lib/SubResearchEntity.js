/* global Affiliation, Authorship, ResearchEntity, Document, TagLabel, SqlService, DocumentOrigins, DocumentKinds, DocumentNotDuplicate, DocumentNotDuplicateGroup, DocumentDuplicate, ExternalImporter */
'use strict';

/**
 * SubResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


const _ = require("lodash");
const BaseModel = require("./BaseModel.js");
const request = require('request-promise');


module.exports = _.merge({}, BaseModel, {
    attributes: {
        getUrlSection: function () {
            return this.getType() + 's';
        },
        compareId(re) {
            return this.getModel().adapter.identity === re.getModel().adapter.identity &&
                this.id === re.id;
        }
    },
    copyDocument: async function (ResearchEntityModel, researchEntityId, documentId) {
        const document = await Document.findOneById(documentId);

        if (!document)
            throw 'Document not found';

        const documentData = Document.selectData(document);
        const authorships = await Authorship.find({document: document.id}).populate('affiliations');
        documentData.authorships = authorships.map(a => {
            const authorship = Authorship.filterFields(a);
            authorship.researchEntity = null;
            return authorship;
        });
        const draft = await ResearchEntityModel.createDraft(ResearchEntityModel, researchEntityId, documentData);
        await Document.moveDocumentNotDuplicates(document.id, draft.id);

        return draft;
    },
    copyDocuments: async function (Model, researchEntityId, documentIds) {
        const results = [];
        for (const documentId of documentIds) {
            const res = await Model.copyDocument(Model, researchEntityId, documentId);
            results.push(res);
        }
        return results;
    },
    unverifyDocument: async function (ResearchEntityModel, researchEntityId, documentId) {
        await this.doUnverifyDocument(ResearchEntityModel, researchEntityId, documentId);
        return await Document.deleteIfNotVerified(documentId);
    },
    doUnverifyDocument: async function (ResearchEntityModel, researchEntityId, documentId) {
        const authorshipModel = getAuthorshipModel(ResearchEntityModel);
        const authorship = await authorshipModel.findOne({researchEntity: researchEntityId, document: documentId});
        if (!authorship)
            return;
        return authorship.unverify();
    },
    undiscardDocument: async function (Model, researchEntityId, documentId) {
        const DiscardedModel = getDiscardedModel(Model);
        await DiscardedModel.destroy({document: documentId, researchEntity: researchEntityId});
        return await Document.deleteIfNotVerified(documentId);
    },
    discardDocument: async function (Model, researchEntityId, documentId) {
        const DiscardedModel = getDiscardedModel(Model);
        await Model.doUnverifyDocument(Model, researchEntityId, documentId);
        const alreadyDiscarded = await DiscardedModel.find({researchEntity: researchEntityId, document: documentId});
        if (alreadyDiscarded.length > 0) {
            sails.log.info(`${Model.identity} ${researchEntityId} tried to discard document ${documentId} but was already discarded`);
            return alreadyDiscarded[0];
        }
        return await DiscardedModel.create({researchEntity: researchEntityId, document: documentId});
    },
    discardDocuments: async function (Model, researchEntityId, documentIds) {
        const results = [];
        for (let documentId of documentIds) {
            const res = await Model.discardDocument(Model, researchEntityId, documentId);
            results.push(res);
        }
        return results;
    },
    verifyDrafts: async function (ResearchEntityModel, researchEntityId, draftIds) {
        const results = [];
        for (let draftId of draftIds) {
            const res = await ResearchEntityModel.verifyDraft(ResearchEntityModel, researchEntityId, draftId);
            results.push(res);
        }
        return results;
    },
    verifyDraft: async function (ResearchEntityModel, researchEntityId, draftId, verificationData, check = true) {
        const draft = await Document.findOneById(draftId)
            .populate('authorships')
            .populate('affiliations');

        const error = await ResearchEntityModel.getDraftVerifyErrors(researchEntityId, draft, verificationData, check);
        if (error)
            return error;
        const authorshipData = await ResearchEntityModel.getAuthorshipsData(draft, researchEntityId, verificationData);

        const documentCopies = await Document.findCopies(draft, authorshipData.position);

        const n = documentCopies.length;
        let docToVerify;
        if (n === 0) {
            docToVerify = await draft.draftToDocument();
        } else {
            if (n > 1)
                sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
            docToVerify = await Document.mergeDraft(documentCopies[0], draft);
        }
        return await ResearchEntityModel.doVerifyDocument(docToVerify, researchEntityId, authorshipData);
    },
    verifyVerifiedDocument: async function (ResearchEntityModel, researchEntityId, document, verificationData, check) {
        const error = await ResearchEntityModel.getDocumentVerifyErrors(researchEntityId, document, verificationData, check);
        if (error)
            return error;

        const DiscardedModel = getDiscardedModel(ResearchEntityModel);
        await DiscardedModel.destroy({document: document.id, researchEntity: researchEntityId});
        const authorshipData = await ResearchEntityModel.getAuthorshipsData(document, researchEntityId, verificationData);
        return await ResearchEntityModel.doVerifyDocument(authorshipData.document, researchEntityId, authorshipData);
    },
    verifyExternalDocument: async function (Model, researchEntityId, document, verificationData) {
        const draft = await Model.copyDocument(Model, researchEntityId, document.id);
        const result = await Model.verifyDraft(Model, researchEntityId, draft.id, verificationData);
        if (!result.id)
            await Document.destroy(draft.id);
        return result;
    },
    verifyDocuments: async function (Model, researchEntityId, documentIds) {
        const results = [];
        for (let documentId of documentIds) {
            const res = await Model.verifyDocument(Model, researchEntityId, documentId);
            results.push(res);
        }
        return results;
    },
    verifyDocument: async function (Model, researchEntityId, documentId, verificationData, check = true) {
        const document = await Document.findOneById(documentId)
            .populate('affiliations')
            .populate('authorships');
        if (document.kind === DocumentKinds.VERIFIED)
            return await Model.verifyVerifiedDocument(Model, researchEntityId, document, verificationData, check);
        else if (document.kind === DocumentKinds.EXTERNAL)
            return await Model.verifyExternalDocument(Model, researchEntityId, document, verificationData);
        else return await Model.verifyDraft(Model, researchEntityId, document.id, verificationData);
    },
    createDraft: async function (ResearchEntityModel, researchEntityId, draftData) {
        const selectedDraftData = Document.selectData(draftData);
        selectedDraftData.kind = DocumentKinds.DRAFT;
        await Document.fixDocumentType(selectedDraftData);
        const researchEntity = await ResearchEntityModel.findOneById(researchEntityId).populate('drafts');
        let draft = await Document.create(selectedDraftData);
        researchEntity.drafts.add(draft);
        await researchEntity.savePromise();
        await Authorship.updateAuthorships(draft, draftData.authorships);
        ExternalImporter.updateDocumentMetadata(selectedDraftData);
        draft = await Document.findOneById(draft.id)
            .populate('authorships')
            .populate('affiliations')
            .populate('authors')
            .populate('source')
            .populate('groups');

        draft.duplicates = await this.getDuplicates(ResearchEntityModel, researchEntityId, draft);

        return draft;
    },
    updateDraft: async function (ResearchEntityModel, draftId, draftData) {
        const d = await Document.findOneById(draftId);
        if (!d.kind || d.kind !== DocumentKinds.DRAFT)
            throw "Draft not found";
        const documentFields = Document.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        selectedDraftData.kind = DocumentKinds.DRAFT;
        selectedDraftData.synchronized = false;
        selectedDraftData.synchronized_at = null;
        await Document.fixDocumentType(selectedDraftData);
        const updatedDrafts = await Document.update({id: draftId}, selectedDraftData);
        const updatedDraft = updatedDrafts[0];
        const authorshipsData = await Authorship.getMatchingAuthorshipsData(updatedDraft, draftData.authorships);
        await Authorship.updateAuthorships(updatedDraft, authorshipsData);
        ExternalImporter.updateDocumentMetadata(selectedDraftData);
        return updatedDraft;
    },
    getDraft: async function (ResearchEntityModel, draftId) {
        const d = await Document.findOneById(draftId);
        if (!d.kind || d.kind !== DocumentKinds.DRAFT)
            throw "Draft not found";
        return d;
    },
    deleteDraft: function (Model, draftId) {
        return Document.destroy({id: draftId});
    },
    deleteDrafts: async function (Model, draftIds) {
        const results = [];
        for (let draftId of draftIds) {
            const res = await Document.destroy({id: draftId});
            results.push(res);
        }
        return results;
    },
    addTags: function (TagModel, userId, documentId, tags) {
        return TagModel.destroy({researchEntity: userId, document: documentId})
            .then(() =>
                tags.forEach(t =>
                    TagLabel
                        .findOrCreate({value: t})
                        .then(tl => TagModel.create({
                            document: documentId,
                            researchEntity: userId,
                            tagLabel: tl.id
                        }))
                )
            )
    },
    removeDocument: async function (researchEntityModel, researchEntityId, documentId) {
        const document = await Document.findOneById(documentId);
        if (document.kind === DocumentKinds.DRAFT)
            await Document.destroy({id: documentId});
        else
            await researchEntityModel.discardDocument(researchEntityModel, researchEntityId, documentId);
    },
    setDocumentsAsNotDuplicate: async function (researchEntityModel, researchEntityId, documentId, duplicateIds) {
        let results = [];

        for (const id of duplicateIds) {
            const res = await researchEntityModel.setDocumentAsNotDuplicate(researchEntityModel, researchEntityId, documentId, id);
            results.push(res);
        }

        return results;
    },
    setDocumentAsNotDuplicate: async function (ResearchEntityModel, researchEntityId, document1Id, document2Id) {
        if (document1Id === document2Id)
            return;

        const minDocId = Math.min(document1Id, document2Id);
        const maxDocId = Math.max(document1Id, document2Id);


        return await ResearchEntityModel.getDocumentNotDuplicateModel().findOrCreate({
            researchEntity: researchEntityId,
            document: minDocId,
            duplicate: maxDocId
        });
    },
    getDuplicates: async function (ResearchEntityModel, researchEntityId, document, excludeDocument) {
        const researchEntityType = ResearchEntityModel.adapter.identity;
        const duplicateCondition = {
            document: document.id,
            researchEntity: researchEntityId,
            researchEntityType,
            duplicateKind: 'v'
        };
        if (excludeDocument) {
            const notduplicates = await ResearchEntityModel.getNotDuplicatesIds(ResearchEntityModel, researchEntityId, excludeDocument);
            const excludedDocuments = notduplicates.concat(excludeDocument);
            duplicateCondition.duplicate = {'!': excludedDocuments};
        }
        return await DocumentDuplicate.find(duplicateCondition);
    },
    makeInternalRequest: async function (subResearchEntityModel, researchEntitySearchCriteria, baseUrl, qs, attribute, skipPopulate) {
        const subResearchEntity = await subResearchEntityModel.findOne(researchEntitySearchCriteria);
        if (!subResearchEntity)
            return {
                error: "404 not found",
                item: researchEntitySearchCriteria
            };
        const subResearchEntityAttributes = [
            'publications',
            'highImpactPublications',
            'documents',
            'disseminationTalks',
            'scientificTalks',
            'favoritePublications',
            'oralPresentations',
            'userData'
        ];
        const path = (subResearchEntityAttributes.includes(attribute)) ?
            `/api/v1/${subResearchEntity.getUrlSection()}/${subResearchEntity.id}/${attribute}` :
            `/api/v1/researchentities/${subResearchEntity.researchEntity}/${attribute}`;
        if (!skipPopulate) {
            if (!_.isArray(qs.populate)) qs.populate = [qs.populate];
            qs.populate = _.union(['source', 'affiliations', 'authorships', 'institutes', 'openaireMetadata'], qs.populate);
            qs.populate = _.union(['type', 'authors', 'affiliations', 'institutes', 'verified', 'source', 'verifiedUsers', 'verifiedGroups'], qs.populate);
        }
        const reqOptions = {
            uri: baseUrl + path,
            json: true,
            qs: qs
        };

        try {
            return await request(reqOptions);
        } catch (e) {
            sails.log.debug('make internal request:');
            sails.log.debug(e);
            return {
                error: "500 internal server error",
                item: e
            };
        }
    },
    removeVerify: async function (ResearchEntityModel, researchEntityId, docToVerifyId, verificationData, docToRemoveId) {
        let errors, res;
        const document = await Document.findOneById(docToVerifyId)
            .populate('authorships')
            .populate('affiliations');
        const isExternal = document.kind === DocumentKinds.EXTERNAL;
        const docToVerify = isExternal ? await ResearchEntityModel.copyDocument(ResearchEntityModel, researchEntityId, docToVerifyId) : document;

        if (docToVerify.isDraft()) {
            errors = await ResearchEntityModel.getDraftVerifyErrors(researchEntityId, docToVerify, verificationData, true, docToRemoveId);
        } else {
            errors = await ResearchEntityModel.getDocumentVerifyErrors(researchEntityId, docToVerify, verificationData, true, docToRemoveId);
        }

        if (errors) {
            if (isExternal)
                await ResearchEntityModel.deleteDraft(ResearchEntityModel, docToVerify.id);

            return errors;
        }

        const notDuplicatesToAdd = await this.getNotDuplicatesIds(ResearchEntityModel, researchEntityId, docToRemoveId);
        await this.setDocumentsAsNotDuplicate(ResearchEntityModel, researchEntityId, docToVerify.id, notDuplicatesToAdd);

        const docToRemove = await Document.findOneById(docToVerifyId);
        if (docToRemove.isDraft()) {
            await ResearchEntityModel.deleteDraft(ResearchEntityModel, docToRemoveId);
        } else {
            await ResearchEntityModel.discardDocument(ResearchEntityModel, researchEntityId, docToRemoveId);
        }
        if (docToVerify.isDraft())
            res = await ResearchEntityModel.verifyDraft(ResearchEntityModel, researchEntityId, docToVerify.id, verificationData);
        else
            res = await ResearchEntityModel.verifyDocument(ResearchEntityModel, researchEntityId, docToVerify.id, verificationData);
        return res;
    },
    replace: async function (ResearchEntityModel, researchEntityId, documentId, documentToBeReplacedId) {
        // Get not duplicates of the document that will be replaced
        const notDuplicates = await this.getNotDuplicates(ResearchEntityModel, researchEntityId, documentToBeReplacedId);
        const notDuplicatesDocumentIds = notDuplicates.map(dnd => dnd.document === documentId ? dnd.duplicate : dnd.document);

        // Unverify document
        await this.unverifyDocument(ResearchEntityModel, researchEntityId, documentToBeReplacedId);

        // Copy the not duplicates to the document
        await this.setDocumentsAsNotDuplicate(ResearchEntityModel, researchEntityId, documentId, notDuplicatesDocumentIds);

        // Delete the not duplicates of the replaced document
        await this.deleteNotDuplicates(ResearchEntityModel, researchEntityId, notDuplicates.map(nd => nd.id));

        return {success: true};
    },
    removeDiscarded: async function (ResearchEntityModel, researchEntityId, documentId) {
        const DiscardedModel = getDiscardedModel(ResearchEntityModel);
        await DiscardedModel.destroy({document: documentId, researchEntity: researchEntityId});
    },
    getNotDuplicatesIds: async function (ResearchEntityModel, researchEntityId, documentId) {
        const dnds = await this.getNotDuplicates(ResearchEntityModel, researchEntityId, documentId);
        return dnds.map(dnd => dnd.document === documentId ? dnd.duplicate : dnd.document);
    },
    getNotDuplicates: async function (ResearchEntityModel, researchEntityId, documentId) {
        const query = {researchEntity: researchEntityId};
        if (documentId)
            query.or = [{document: documentId}, {duplicate: documentId}];

        return await ResearchEntityModel.getDocumentNotDuplicateModel().find(query);
    },
    deleteNotDuplicates: async function (ResearchEntityModel, researchEntityId, notDuplicateIds) {
        let results = [];

        for (let i = 0; i < notDuplicateIds.length; i++) {
            const notDuplicateId = notDuplicateIds[i];
            const res = await ResearchEntityModel.getDocumentNotDuplicateModel().destroy({
                researchEntity: researchEntityId,
                id: notDuplicateId
            });
            results.push(res);
        }

        return results;
    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
});

function getThroughModel(ResearchEntityModel, fieldName) {
    const throughModelName = ResearchEntityModel._attributes[fieldName].through;
    return sails.models[throughModelName];
}

function getAuthorshipModel(ResearchEntityModel) {
    return getThroughModel(ResearchEntityModel, 'documents');
}

function getDiscardedModel(ResearchEntityModel) {
    return getThroughModel(ResearchEntityModel, 'discardedDocuments');
}
