/* global ResearchEntity, Reference */

/**
 * ResearchEntity.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */


var Promise = require("bluebird");


module.exports = {
    attributes: {
        getAllReferences: function () {
            return _.union(
                    this.publicReferences,
                    this.privateReferences,
                    this.drafts);
        },
        getVerifiedReferences: function () {
            return _.union(
                    this.publicReferences,
                    this.privateReferences);
        },
        savePromise: function () {
            var self = this;
            return new Promise(function (resolve, reject) {
                self.save(function (err) {
                    if (err)
                        reject(err);
                    else
                        resolve();
                });
            });
        }
    },
    getOne: function (ResearchEntity, researchEntityId, populateFields) {
        var query = ResearchEntity.findOneById(researchEntityId)
                .populate('publicReferences')
                .populate('privateReferences')
                .populate('drafts');
        _.forEach(populateFields, function (f) {
            query = query.populate(f);
        });
        return query
                .then(function (researchEntity) {
                    var publicReferencesId = _.map(researchEntity.publicReferences, 'id');
                    var privateReferencesId = _.map(researchEntity.privateReferences, 'id');
                    var draftsId = _.map(researchEntity.drafts, 'id');
                    return Promise.all([
                        researchEntity,
                        Reference.getByIdsWithAuthors(publicReferencesId),
                        Reference.getByIdsWithAuthors(privateReferencesId),
                        Reference.getByIdsWithAuthors(draftsId)
                    ]);
                })
                .spread(function (researchEntity, publicReferences, privateReferences, drafts) {
                    //sTODO: refactor
                    _.forEach(publicReferences, function (r) {
                        r.status = Reference.PUBLIC;
                    });
                    _.forEach(privateReferences, function (r) {
                        r.status = Reference.VERIFIED;
                    });
                    _.forEach(drafts, function (r) {
                        r.status = Reference.DRAFT;
                    });
                    delete researchEntity.publicReferences;
                    delete researchEntity.privateReferences;
                    delete researchEntity.drafts;
                    researchEntity.references = _.union(publicReferences, privateReferences, drafts);
                    return researchEntity;
                });
    },
    getSearchFilterFunction: function (filterKey) {
        //sTODO: use map
        var filters = {
            'all': 'getAllReferences',
            'verified': 'getVerifiedReferences'
        };
        if (filterKey in filters)
            return filters[filterKey];
        else
            return filters['all'];
    },
    getReferences: function (researchEntityModel, researchEntityId, populateFields, filterKey) {
        var filterFunction = this.getSearchFilterFunction(filterKey);
        return researchEntityModel.findOneById(researchEntityId)
                .populate('publicReferences')
                .populate('privateReferences')
                .populate('drafts')
                .then(function (researchEntity) {
                    var references = researchEntity[filterFunction]();
                    var referencesId = _.map(references, 'id');
                    var query = Reference.findById(referencesId);
                    _.forEach(populateFields, function (f) {
                        query = query.populate(f);
                    });
                    return query;
                });
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
    //sTODO: only drafts can be deleted
    unverifyDocument: function (ResearchEntityModel, researchEntityId, referenceId) {
        return ResearchEntityModel
                .findOneById(researchEntityId)
                .populate('privateReferences')
                .populate('publicReferences')
                .then(function (researchEntity) {
                    researchEntity.privateReferences.remove(referenceId);
                    researchEntity.publicReferences.remove(referenceId);
                    return researchEntity.savePromise();
                })
                .then(function () {
                    return Reference.deleteIfNotVerified(referenceId);
                });
    },
    verifyReference: function (ResearchEntity, researchEntityId, referenceId) {
        return ResearchEntity.findOneById(researchEntityId)
                .then(function (researchEntity) {
                    researchEntity.privateReferences.add(referenceId);
                    return researchEntity.savePromise();
                });
    },
    verifyDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.verifyReference(Model, researchEntityId, documentId);
        }));
    },
    copyDrafts: function (Model, researchEntityId, documents) {
        return Promise.all(documents.map(function (document) {
            return Model.copyDraft(researchEntityId, document);
        }));
    },
    filterNecessaryReferences: function (userId, ResearchEntity, maybeSuggestedReferences) {
        var maybeSuggestedReferencesId = _.map(maybeSuggestedReferences, 'id');
        return Promise.all([
            Reference.getByIdsWithAuthors(maybeSuggestedReferencesId),
            //sTODO: refactor
            ResearchEntity.getReferences(ResearchEntity, userId, [], 'verified')
        ])
                .spread(function (maybeSuggestedReferences, authoredReferences) {
                    var similarityThreshold = .98;
                    //sTODO: add check on discarded references
                    return Reference.filterSuggested(maybeSuggestedReferences, authoredReferences, similarityThreshold);
                });
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
                            .then(function(){return true;});
                });

    },
    discardDocuments: function (Model, researchEntityId, documentIds) {
        return Promise.all(documentIds.map(function (documentId) {
            return Model.discardDocument(researchEntityId, documentId);
        }));
    },
    verifyDrafts: function (Model, researchEntityId, draftIds) {
        return Promise.all(draftIds.map(function (draftId) {
            return Model.verifyDraft(researchEntityId, draftId);
        }));
    },
    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    }
};

