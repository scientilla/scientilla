/* global Affiliation, Authorship, ResearchEntity, Document, TagLabel, SqlService, DocumentOrigins, DocumentKinds */
'use strict';

/**
 * ResearchEntity.js
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
        }
    },
    copyDocument: async function (Model, researchEntityId, documentId) {
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
        return await Model.createDraft(Model, researchEntityId, documentData);
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
        const newDiscarded = await DiscardedModel.create({researchEntity: researchEntityId, document: documentId});
        return newDiscarded;
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
    verifyDraft: async function (ResearchEntityModel, researchEntityId, draftId, verificationData) {
        const draft = await Document.findOneById(draftId)
            .populate('authorships')
            .populate('affiliations');

        const error = await ResearchEntityModel.getDraftVerifyErrors(researchEntityId, draft, verificationData);
        if (error)
            return error;
        const authorshipData = await ResearchEntityModel.getAuthorshipsData(draft, researchEntityId, verificationData);

        const documentCopies = await Document.findCopies(draft, authorshipData.position);

        const n = documentCopies.length;
        let docToVerify;
        if (n === 0) {
            docToVerify = await draft.draftToDocument();
        }
        else {
            if (n > 1)
                sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
            docToVerify = documentCopies[0];

            await Document.mergeAuthorships(draft, docToVerify);
            sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + docToVerify.id);
            await Document.destroy({id: draft.id});
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
        const draft = await Document.create(selectedDraftData);
        researchEntity.drafts.add(draft);
        await researchEntity.savePromise();
        await Authorship.updateAuthorships(draft, draftData.authorships);
        return await Document.findOneById(draft.id)
            .populate('authorships')
            .populate('affiliations')
            .populate('authors')
            .populate('source');
    },
    updateDraft: async function (ResearchEntityModel, draftId, draftData) {
        const d = await Document.findOneById(draftId);
        if (!d.kind || d.kind !== DocumentKinds.DRAFT)
            throw "Draft not found";
        const documentFields = Document.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        selectedDraftData.kind = DocumentKinds.DRAFT;
        selectedDraftData.synchronized = false;
        await Document.fixDocumentType(selectedDraftData);
        const updatedDrafts = await Document.update({id: draftId}, selectedDraftData);
        const updatedDraft = updatedDrafts[0];
        const authorshipsData = await Authorship.getMatchingAuthorshipsData(updatedDraft, draftData.authorships);
        await Authorship.updateAuthorships(updatedDraft, authorshipsData);
        return updatedDraft;
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
    setDocumentAsNotDuplicate: async function (researchEntityModel, researchEntityId, document1Id, document2Id) {
        const DocumentNotDuplicatedModel = getDocumentNotDuplicateModel(researchEntityModel);
        const minDocId = Math.min(document1Id, document2Id);
        const maxDocId = Math.max(document1Id, document2Id);
        const documentNotDuplicate = await DocumentNotDuplicatedModel.create({
            researchEntity: researchEntityId,
            document: minDocId,
            duplicate: maxDocId
        });
        return documentNotDuplicate;
    },
    getDuplicates: async function(ResearchEntityModel, researchEntityId, document) {
        const researchEntityType = ResearchEntityModel.adapter.identity;
        const duplicateCondition = {
            document: document.id,
            researchEntity: researchEntityId,
            researchEntityType,
            duplicateKind: 'v'
        };
        const duplicates = await DocumentDuplicate.find(duplicateCondition);
        return duplicates;
    },
    makeInternalRequest: async function (researchEntityModel, researchEntitySearchCriteria, baseUrl, qs, attribute) {
        const researchEntity = await researchEntityModel.findOne(researchEntitySearchCriteria);
        if (!researchEntity)
            return {
                error: "404 not found",
                item: researchEntitySearchCriteria
            };
        const path = `/api/v1/${researchEntity.getUrlSection()}/${researchEntity.id}/${attribute}`;
        if (!_.isArray(qs.populate)) qs.populate = [qs.populate];
        qs.populate = _.union(['source', 'affiliations', 'authorships', 'institutes'], qs.populate);
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
        }
    },
    removeVerify: async function (ResearchEntityModel, researchEntityId, docToVerifyId, verificationData, docToRemoveId) {
        const document = await Document.findOneById(docToVerifyId)
            .populate('authorships')
            .populate('affiliations');
        let docToVerify, isExternal = document.kind === DocumentKinds.EXTERNAL;
        if (isExternal)
            docToVerify = await ResearchEntityModel.copyDocument(ResearchEntityModel, researchEntityId, docToVerifyId);
        else
            docToVerify = document;
        let errors, isDraft = docToVerify.isDraft(), res;
        if (isDraft) {
            errors = await ResearchEntityModel.getDraftVerifyErrors(researchEntityId, docToVerify, verificationData, docToRemoveId);
        }
        else {
            errors = await ResearchEntityModel.getDocumentVerifyErrors(researchEntityId, docToVerify, verificationData, true, docToRemoveId);
        }
        if (errors) {
            if (isExternal)
                ResearchEntityModel.deleteDraft(ResearchEntityModel, docToVerify.id);
            return errors;
        }
        await ResearchEntityModel.discardDocument(ResearchEntityModel, researchEntityId, docToRemoveId);
        if (isDraft)
            res = await ResearchEntityModel.verifyDraft(ResearchEntityModel, researchEntityId, docToVerify.id, verificationData);
        else
            res = await ResearchEntityModel.verifyDocument(ResearchEntityModel, researchEntityId, docToVerify.id, verificationData);
        return res;
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

function getDocumentNotDuplicateModel(ResearchEntityModel) {
    return getThroughModel(ResearchEntityModel, 'notDuplicateDocuments');
}