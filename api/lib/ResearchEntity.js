/* global ResearchEntity, Document, SqlService */
'use strict';

/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


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
    unverifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        return this
            .doUnverifyDocument(ResearchEntityModel, researchEntityId, documentId)
            .then(function () {
                return Document.deleteIfNotVerified(documentId);
            });
    },
    doUnverifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        var authorshipModel = getAuthorshipModel(ResearchEntityModel);
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
    verifyDraft: function (ResearchEntityModel, researchEntityId, draftId, position, affiliationInstituteIds, corresponding) {
        return Document.findOneById(draftId)
            .populate('authorships')
            .populate('affiliations')
            .then(draft => {
                if (!draft || draft.kind !== DocumentKinds.DRAFT)
                    throw {
                        error: 'Draft not found',
                        item: draftId
                    };
                if (!draft.isValid())
                    throw {
                        error: 'Draft not valid for verification',
                        item: draft
                    };
                return ResearchEntityModel.getAuthorshipsData(draft, researchEntityId, position, affiliationInstituteIds, corresponding)
                    .then(authorshipData => {
                        if (!authorshipData.isVerifiable)
                            throw {
                                error: authorshipData.error,
                                item: authorshipData.document
                            };

                        return Document.findCopies(draft, authorshipData.position)
                            .then(documents => {
                                var n = documents.length;
                                if (n === 0) return draft;
                                if (n > 1)
                                    sails.log.debug('Too many similar documents to ' + draft.id + ' ( ' + n + ')');
                                var doc = documents[0];

                                if (doc.isPositionVerified(authorshipData.position))
                                    throw {
                                        error: "The position is already verified",
                                        item: doc
                                    };

                                sails.log.debug('Draft ' + draft.id + ' will be deleted and substituted by ' + doc.id);
                                return Document.destroy({id: draft.id}).then(_ => doc);
                            })
                            .then(d => d.draftToDocument())
                            .then(d => ResearchEntityModel.doVerifyDocument(d, researchEntityId, authorshipData));
                    });
            })
            .catch(e => {
                if (e.error)
                    return {
                        error: e.error,
                        item: e.item
                    };
                throw e;
            });
    },
    verifyDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(documentId => Model.verifyDocument(Model, researchEntityId, documentId)));
    },
    verifyDocument: function (Model, researchEntityId, documentId, position, affiliationInstituteIds, corresponding) {
        const DiscardedModel = getDiscardedModel(Model);
        return DiscardedModel.destroy({document: documentId})
            .then(() => Document.findOneById(documentId)
                .populate('affiliations')
                .populate('authorships')
            )
            .then(document => {
                if (!document)
                    throw {
                        error: 'Document not found',
                        item: researchEntityId
                    };
                return Model.getAuthorshipsData(document, researchEntityId, position, affiliationInstituteIds, corresponding)
            })
            .then(authorshipData => {
                if (!authorshipData.isVerifiable)
                    throw {
                        error: authorshipData.error,
                        item: authorshipData.document
                    };


                if (authorshipData.document.isPositionVerified(authorshipData.position))
                    throw {
                        error: "The position is already verified",
                        item: authorshipData.document
                    };
                return Model.doVerifyDocument(authorshipData.document, researchEntityId, authorshipData);
            })
            .catch(e => ({
                error: e.error,
                item: e.item
            }));
    },
    updateDraft: async function (ResearchEntityModel, draftId, draftData) {
        const documentFields = Document.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        const updatedDraft = await Document.update({id: draftId}, selectedDraftData);
        return updatedDraft[0];
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
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
});

function getThroughModel(ResearchEntityModel, fieldName) {
    var throughModelName = ResearchEntityModel._attributes[fieldName].through;
    return sails.models[throughModelName];
}

function getAuthorshipModel(ResearchEntityModel) {
    return getThroughModel(ResearchEntityModel, 'documents');
}

function getDiscardedModel(ResearchEntityModel) {
    return getThroughModel(ResearchEntityModel, 'discardedDocuments');
}