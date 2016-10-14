/* global ResearchEntity, Reference, SqlService */

"use strict";
/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var Promise = require("bluebird");


module.exports = {
    attributes: {
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve(self);
                });
            });
        }
    },
    createDraft: function (ResearchEntityModel, researchEntityId, draftData) {
        var fields = Reference.getFields();
        var draftData = _.pick(draftData, fields);
        draftData.draft = true;
        return Promise.all([
            ResearchEntityModel.findOneById(researchEntityId).populate('drafts'),
            Reference.create(draftData)
        ])
                .spread(function (researchEntity, draft) {
                    researchEntity.drafts.add(draft);
                    return Promise.all([
                        draft.id,
                        researchEntity.savePromise()
                    ]);
                })
                .spread(function (draftId) {
                    return Reference.findOneById(draftId);
                });
    },
    unverifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        var authorshipModel = getAuthorshipModel(ResearchEntityModel);
        return authorshipModel
                .findOne({researchEntity: researchEntityId, document: documentId})
                .then(function (authorship) {
                    if (!authorship)
                        throw new Error('Authorship ' + documentId + ' does not exist');
                    return authorship.destroy();
                })
                .then(function () {
                    return Reference.deleteIfNotVerified(documentId);
                });
    },
    verifyDocument: function (ResearchEntityModel, researchEntityId, documentId) {
        var authorshipModel = getAuthorshipModel(ResearchEntityModel);
        return authorshipModel.create({researchEntity: researchEntityId, document: documentId})
            .then(function () {
                return Reference.findOneById(documentId);
            });
    },
    verifyDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.verifyDocument(Model, researchEntityId, documentId);
        }));
    },
    copyDrafts: function (Model, researchEntityId, documents) {
        return Promise.all(documents.map(function (document) {
            return Model.copyDraft(researchEntityId, document);
        }));
    },
    discardDocument: function (researchEntityId, documentId) {
        return this
                .findOneById(researchEntityId)
                .populate('discardedReferences')
                .then(function (researchEntity) {

                    var doc = _.find(
                            researchEntity.discardedReferences,
                            {id: documentId});

                    if (doc)
                        return false;

                    researchEntity
                            .discardedReferences
                            .add(documentId);

                    return researchEntity
                            .savePromise()
                            .then(function () {
                                return true;
                            });
                });

    },
    discardDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.discardDocument(researchEntityId, documentId);
        }));
    },
    verifyDraft: function (ResearchEntityModel, researchEntityId, draftId) {
        return Reference.verifyDraft(draftId, ResearchEntityModel, researchEntityId);
    },
    verifyDrafts: function (ResearchEntityModel, researchEntityId, draftIds) {
        return Promise.all(draftIds.map(function (draftId) {
            return ResearchEntityModel.verifyDraft(ResearchEntityModel, researchEntityId, draftId);
        }));
    },
    getAllDocuments: function (ResearchEntity, researchEntityid) {
        return ResearchEntity
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
    checkCopiedDocuments: function (ResearchEntity, researchEntityId, suggestedDocuments) {
        var threeshold = .50;
        return ResearchEntity.getAllDocuments(ResearchEntity, researchEntityId)
                .then(function (documents) {
                    suggestedDocuments.forEach(function (suggestedDoc) {
                        var isCopied = _.some(documents, function (d) {
                            return d.getSimiliarity(suggestedDoc) >= threeshold;
                        });
                        if (!suggestedDoc.tags)
                            suggestedDoc.tags = [];
                        if (isCopied)
                            suggestedDoc.tags.push('copied');
                    });
                    return suggestedDocuments;
                });
    },
    getSuggestedDocuments: function (ResearchEntity, researchEntityId, query) {
        function checkDiscardedRows(rows) {
            rows.forEach(function (row) {
                if (!row.tags)
                    row.tags = [];
                if (row.discarded)
                    row.tags.push('discarded');
                delete row.discarded;
            });
            return rows;
        }

        return ResearchEntity.getSuggestedDocumentsQuery(researchEntityId, query)
                .then(SqlService.generateFromJson)
                .then(SqlService.query)
                .then(checkDiscardedRows)
                .then(function (rows) {
                    return ResearchEntity.checkCopiedDocuments(ResearchEntity, researchEntityId, rows);
                });

    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
};

function getAuthorshipModel(ResearchEntityModel) {
    var authorshipModelName =  ResearchEntityModel._attributes.documents.through;
    return sails.models[authorshipModelName];
}