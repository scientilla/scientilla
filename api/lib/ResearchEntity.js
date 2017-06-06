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


module.exports = _.merge({}, BaseModel, {
    attributes: {},
    createDraft: function (ResearchEntityModel, researchEntityId, draftData) {
        const selectedDraftData = Document.selectData(draftData);
        selectedDraftData.kind = DocumentKinds.DRAFT;
        return Promise.all([
            ResearchEntityModel.findOneById(researchEntityId).populate('drafts'),
            Document.create(selectedDraftData)
        ])
            .spread(function (researchEntity, draft) {
                researchEntity.drafts.add(draft);
                return Promise.all([
                    draft.id,
                    researchEntity.savePromise()
                ]);
            })
            .spread(function (draftId) {
                return Promise.all([
                    draftId,
                    Authorship.createEmptyAuthorships(draftId, draftData)
                ]);
            })
            .spread(function (draftId) {
                return Document.findOneById(draftId)
                    .populate('authorships')
                    .populate('affiliations')
                    .populate('authors')
                    .populate('source');
            });
    },
    unverifyDocument: async function (ResearchEntityModel, researchEntityId, documentId) {
        await this.doUnverifyDocument(ResearchEntityModel, researchEntityId, documentId)
        const deletedDocument = await Document.deleteIfNotVerified(documentId);
        return deletedDocument;
    },
    doUnverifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        const authorshipModel = getAuthorshipModel(ResearchEntityModel);
        return authorshipModel
            .findOne({researchEntity: researchEntityId, document: documentId})
            .then(function (authorship) {
                if (!authorship)
                    return;
                return authorship.unverify();
            });
    },
    createDrafts: function (Model, researchEntityId, documents) {
        return Promise.all(documents.map(function (document) {
            return Model.createDraft(Model, researchEntityId, document);
        }));
    },
    discardDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.discardDocument(researchEntityId, documentId);
        }));
    },
    verifyDrafts: function (ResearchEntityModel, researchEntityId, draftIds) {
        return Promise.all(
            draftIds.map(draftId => ResearchEntityModel.verifyDraft(ResearchEntityModel, researchEntityId, draftId))
        );
    },
    verifyDraft: async function (ResearchEntityModel, researchEntityId, draftId, position, affiliationInstituteIds, corresponding) {
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

        const authorshipData = await ResearchEntityModel.getAuthorshipsData(draft, researchEntityId, position, affiliationInstituteIds, corresponding);

        if (!authorshipData.isVerifiable)
            return {
                error: authorshipData.error,
                item: authorshipData.document
            };

        const documentCopies = await Document.findCopies(draft, authorshipData.position);

        var n = documentCopies.length;
        let docToVerify;
        if (n === 0) {
            docToVerify = await draft.draftToDocument();
        }
        else {
            if (n > 1)
                sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
            docToVerify = documentCopies[0];

            if (docToVerify.isPositionVerified(authorshipData.position))
                return {
                    error: "The position is already verified",
                    item: documentCopy
                };

            sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + docToVerify.id);
            await Document.destroy({id: draft.id});
        }

        const newDoc = await ResearchEntityModel.doVerifyDocument(docToVerify, researchEntityId, authorshipData);

        return newDoc;
    },
    verifyDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(documentId => Model.verifyDocument(Model, researchEntityId, documentId)));
    },
    verifyDocument: async function (Model, researchEntityId, documentId, position, affiliationInstituteIds, corresponding) {
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
        const authorshipData = await Model.getAuthorshipsData(document, researchEntityId, position, affiliationInstituteIds, corresponding)
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
        const verifiedDocument = await Model.doVerifyDocument(authorshipData.document, researchEntityId, authorshipData);
        return verifiedDocument;
    },
    updateDraft: async function (ResearchEntityModel, draftId, draftData) {
        const documentFields = Document.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        selectedDraftData.editedAfterImport = true;
        const updatedDraft = await Document.update({id: draftId}, selectedDraftData);
        return updatedDraft[0];
    },
    deleteDrafts: function (Model, draftIds) {
        return Promise.all(draftIds.map(function (draftId) {
            return Document.destroy({id: draftId});
        }));
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
    setAuthorships: async function (ResearchEntityModel, researchEntityId, draftId, authorshipsData) {
        authorshipsData.forEach(a => delete a.id);
        const deleteAuthorships = await Authorship.destroy({document: draftId});
        await Affiliation.destroy({authorship: deleteAuthorships.map(a => a.id)});
        return Authorship.create(authorshipsData);
    },
    updateProfile: async function (ResearchEntityModel, researchEntityId, researchEntityData) {
        const oldResearchEntity = await ResearchEntityModel.findOne({id: researchEntityId});
        const res = await ResearchEntityModel.update({id: researchEntityId}, researchEntityData);
        const newResearchEntity = res[0];
        const researchEntityType = newResearchEntity.getType();
        const command = 'grunt external:import:' + researchEntityType + ':' + newResearchEntity.id;
        if (newResearchEntity.scopusId !== oldResearchEntity.scopusId)
            exec(command + ':' + DocumentOrigins.SCOPUS);
        if (newResearchEntity.username !== oldResearchEntity.username
            || newResearchEntity.publicationsAcronym !== oldResearchEntity.publicationsAcronym)
            exec(command + ':' + DocumentOrigins.PUBLICATIONS);

        return newResearchEntity;
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