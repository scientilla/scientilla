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
        const selectedDraftData = Document.selectDraftData(draftData);
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
                    Authorship.createDraftAuthorships(draftId, draftData)
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
        var authorshipModel = getAuthorshipModel(ResearchEntityModel);
        return authorshipModel
            .findOne({researchEntity: researchEntityId, document: documentId})
            .then(function (authorship) {
                if (!authorship)
                    throw new Error('Authorship ' + documentId + ' does not exist');
                authorship.researchEntity = null;
                return authorship.savePromise();
            })
            .then(function () {
                return Document.deleteIfNotVerified(documentId);
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
                if (!draft || !draft.draft)
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
        return Document.findOneById(documentId)
            .populate('affiliations')
            .populate('authorships')
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
    updateDraft: function (ResearchEntityModel, draftId, draftData) {
        const documentFields = Document.getFields();
        const selectedDraftData = _.pick(draftData, documentFields);
        return Document.update({id: draftId}, selectedDraftData)
    },
    getAllDocuments: function (ResearchEntityModel, researchEntityid) {
        return ResearchEntityModel
            .findOneById(researchEntityid)
            .populate('drafts')
            .populate('documents')
            .then(function (researchEntity) {
                return _.union(
                    researchEntity.drafts,
                    researchEntity.documents
                );
            });
    },
    checkCopiedDocuments: function (ResearchEntityModel, researchEntityId, documentsToCheck) {
        var threeshold = .50;
        return ResearchEntityModel.getAllDocuments(ResearchEntityModel, researchEntityId)
            .then(function (documents) {
                documentsToCheck.forEach(function (docToCheck) {
                    var isCopied = _.some(documents, function (d) {
                        return d.getSimiliarity(docToCheck) >= threeshold;
                    });
                    if (!docToCheck.tags)
                        docToCheck.tags = [];
                    if (isCopied)
                        docToCheck.tags.push('copied');
                });
                return documentsToCheck;
            });
    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
});

function getAuthorshipModel(ResearchEntityModel) {
    var authorshipModelName = ResearchEntityModel._attributes.documents.through;
    return sails.models[authorshipModelName];
}