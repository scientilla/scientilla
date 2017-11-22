/* global Affiliation, Authorship, ResearchEntity, Document, TagLabel, SqlService, DocumentOrigins */
'use strict';

/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


const exec = require('child_process').exec;
const Promise = require("bluebird");
const _ = require("lodash");
const BaseModel = require("./BaseModel.js");
const request = require('request-promise');


module.exports = _.merge({}, BaseModel, {
    attributes: {
        getUrlSection: function () {
            return this.getType() + 's';
        }
    },
    createDraft: async function (ResearchEntityModel, researchEntityId, draftData) {
        const selectedDraftData = Document.selectData(draftData);
        selectedDraftData.kind = DocumentKinds.DRAFT;
        await Document.fixDocumentType(selectedDraftData);
        const researchEntity = await ResearchEntityModel.findOneById(researchEntityId).populate('drafts');
        const draft = await Document.create(selectedDraftData);
        researchEntity.drafts.add(draft);
        await researchEntity.savePromise();
        await Authorship.createEmptyAuthorships(draft, draftData.authorships);
        const completeDraft = await Document.findOneById(draft.id)
            .populate('authorships')
            .populate('affiliations')
            .populate('authors')
            .populate('source');
        return completeDraft;
    },
    copyDocument: async function (Model, researchEntityId, documentId) {
        const document = await Document.findOneById(documentId);

        if (!document)
            throw 'Document not found';

        const documentData = Document.selectData(document);
        documentData.authorships = await Authorship.find({document: document.id}).populate('affiliations');
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
        const AuthorshipModel = getAuthorshipModel(Model);
        const authorships = await AuthorshipModel.find({document: documentId, researchEntity: researchEntityId});
        if (authorships.length > 0) {
            return {
                error: 'Document verified, must be unverified',
                item: documentId
            };
        }
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

        if (!draft || draft.kind !== DocumentKinds.DRAFT)
            return {
                error: 'Draft not found',
                item: draftId
            };
        if (!draft.isValid())
            return {
                error: 'Draft not valid for verification',
                item: draft
            };
        if (draft.scopusId) {
            const alreadyVerifiedDocuments = (await ResearchEntityModel
                .findOne(researchEntityId)
                .populate('documents', {
                    scopusId: draft.scopusId
                })).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Draft already verified (duplicated scopusId)',
                    item: draft
                };
        }

        const authorshipData = await ResearchEntityModel.getAuthorshipsData(draft, researchEntityId, verificationData);

        if (!authorshipData.isVerifiable)
            return {
                error: authorshipData.error,
                item: authorshipData.document
            };

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

            if (docToVerify.isPositionVerified(authorshipData.position)) {
                const authorName = docToVerify.authorsStr.split(', ')[authorshipData.position];
                return {
                    error: `You cannot verify this document as ${authorName} because someone else already claimed to be that author`,
                    item: docToVerify
                };
            }
            await Document.addMissingAffiliation(docToVerify, draft, authorshipData.position);
            sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + docToVerify.id);
            await Document.destroy({id: draft.id});
        }

        return await ResearchEntityModel.doVerifyDocument(docToVerify, researchEntityId, authorshipData);
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
        const AuthorshipModel = getAuthorshipModel(Model);
        const alreadyVerifiedDocuments = await AuthorshipModel.find({
            document: documentId,
            researchEntity: researchEntityId
        });
        if (alreadyVerifiedDocuments.length)
            return {
                error: 'Document already verified',
                item: researchEntityId
            };

        const DiscardedModel = getDiscardedModel(Model);
        await  DiscardedModel.destroy({document: documentId, researchEntity: researchEntityId});
        const document = await Document.findOneById(documentId)
            .populate('affiliations')
            .populate('authorships');
        if (!document || document.kind !== DocumentKinds.VERIFIED)
            return {
                error: 'Document not found',
                item: researchEntityId
            };
        if (check && document.scopusId) {
            const alreadyVerifiedDocuments = (await Model
                .findOne(researchEntityId)
                .populate('documents', {
                    scopusId: document.scopusId
                })).documents;
            if (alreadyVerifiedDocuments.length)
                return {
                    error: 'Document already verified (duplicated scopusId)',
                    item: document
                };
        }
        const authorshipData = await Model.getAuthorshipsData(document, researchEntityId, verificationData);

        if (!authorshipData.isVerifiable)
            return {
                error: authorshipData.error,
                item: authorshipData.document
            };

        if (authorshipData.document.isPositionVerified(authorshipData.position))
            return {
                error: "The position is already verified",
                item: authorshipData.document
            };

        return await Model.doVerifyDocument(authorshipData.document, researchEntityId, authorshipData);
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
        const updatedDraft = await Document.update({id: draftId}, selectedDraftData);
        return updatedDraft[0];
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
    makeInternalRequest: async function (researchEntityModel, researchEntitySearchCriteria, baseUrl, qs, attribute) {
        const researchEntity = await researchEntityModel.findOne(researchEntitySearchCriteria);
        if (!researchEntity)
            return {
                error: "404 not found",
                item: researchEntitySearchCriteria
            };
        const path = `/api/v1/${researchEntity.getUrlSection()}/${researchEntity.id}/${attribute}`;
        qs.populate = ['source', 'affiliations', 'authorships', 'institutes', 'documenttype'];
        const reqOptions = {
            uri: baseUrl + path,
            json: true,
            qs: qs
        };
        const r = await request(reqOptions);
        return r;
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