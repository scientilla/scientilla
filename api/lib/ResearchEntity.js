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
    checkCopiedDocuments: function (ResearchEntityModel, researchEntityId, documentsToCheck, includeDrafts) {
        var threeshold = .85;
        return Promise.all(_.map(documentsToCheck, function (docToCheck) {
            return getSimilarDocuments(ResearchEntityModel, researchEntityId, docToCheck, includeDrafts)
                .then(function (documentsToCompare) {
                    var isCopied = _.some(documentsToCompare, d => d.getSimiliarity(docToCheck) >= threeshold);
                    if (!docToCheck.tags)
                        docToCheck.tags = [];
                    if (isCopied)
                        docToCheck.tags.push('copied');
                    return docToCheck;
                });
        }));
    },
    addTags: function (TagModel, userId, documentId, tags) {
        return TagModel.destroy({researchEntity: userId, document: documentId})
            .then(()=>
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

function getSimilarDocuments(ResearchEntityModel, researchEntityid, doc, includeDrafts) {
    const criteria = {or: []};
    if (doc.id)
        criteria.id = {'!': doc.id};
    if (doc.title)
        criteria.or.push({title: doc.title});
    if (doc.doi)
        criteria.or.push({doi: doc.doi});
    if (doc.scopusId)
        criteria.or.push({scopusId: doc.scopusId});
    if (doc.authorsStr)
        criteria.or.push(...doc.authorsStr.split(', ').map( author => ({authorsStr: { contains: author}})));
    if (_.isEmpty(criteria.or))
        delete criteria.or;
    let q = ResearchEntityModel
        .findOneById(researchEntityid)
        .populate('documents', criteria);

    if (includeDrafts)
        q = q.populate('drafts', criteria);

    return q.then(function (researchEntity) {
        return _.union(
            researchEntity.drafts,
            researchEntity.documents
        );
    });
}