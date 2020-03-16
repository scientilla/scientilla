/* global Connector, sails */
"use strict";

module.exports = {
    createDraft: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const draftData = req.body;
        const Model = getModel(req);
        return res.halt(Model.createDraft(Model, researchEntityId, draftData));
    },
    unverifyDocument: function (req, res) {
        const researcEntityId = req.params.researchEntityId;
        const documentId = req.params.documentId;
        const Model = getModel(req);
        res.halt(Model.unverifyDocument(Model, researcEntityId, documentId));
    },
    verifyDraft: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const draftId = req.params.draftId;
        const verificationData = Authorship.filterFields(req.body);
        verificationData.affiliationInstituteIds = req.body.affiliations;
        const Model = getModel(req);
        res.halt(Model.verifyDraft(Model, researchEntityId, draftId, verificationData));
    },
    verifyDrafts: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const draftIds = req.param('draftIds');
        const Model = getModel(req);
        res.halt(Model.verifyDrafts(Model, researchEntityId, draftIds));
    },
    verifyDocument: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.body.id;
        const verificationData = Authorship.filterFields(req.body);
        verificationData.affiliationInstituteIds = req.body.affiliations;
        const Model = getModel(req);
        // TODO in case of failed verify give response with details instead of 400
        res.halt(Model.verifyDocument(Model, researchEntityId, documentId, verificationData));
    },
    verifyDocuments: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentIds = req.param('documentIds');
        const Model = getModel(req);
        res.halt(Model.verifyDocuments(Model, researchEntityId, documentIds));
    },
    discardDocument: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.param('documentId');
        const Model = getModel(req);
        res.halt(Model.discardDocument(Model, researchEntityId, documentId));
    },
    discardDocuments: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentIds = req.param('documentIds');
        const Model = getModel(req);
        res.halt(Model.discardDocuments(Model, researchEntityId, documentIds));
    },
    copyDocument: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.param('documentId');
        const Model = getModel(req);
        res.halt(Model.copyDocument(Model, researchEntityId, documentId));
    },
    copyDocuments: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentIds = req.param('documentIds');
        const Model = getModel(req);
        res.halt(Model.copyDocuments(Model, researchEntityId, documentIds));
    },
    updateDraft: function (req, res) {
        const draftId = req.params.id;
        const draftData = req.body;
        const Model = getModel(req);
        res.halt(Model.updateDraft(Model, draftId, draftData));
    },
    getChartsData: function (req, res) {
        const Model = getModel(req);
        const id = req.params.researchEntityId;
        const refresh = req.param('refresh') === 'true';
        const chartsKeys = req.param('charts') || [];
        res.halt(Chart.getChartsData(id, Model, chartsKeys, refresh));
    },
    setAuthorhips: function (req, res) {
        const draftId = req.params.documentId;
        const authorshipsData = req.body;
        res.halt(Document.setAuthorships(draftId, authorshipsData));
    },
    updateProfile: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const Model = getModel(req);
        const researchEntityData = req.body;
        res.halt(Model.updateProfile(researchEntityId, researchEntityData));
    },
    deleteDraft: function (req, res) {
        const Model = getModel(req);
        const draftId = req.params.draftId;
        res.halt(Model.deleteDraft(Model, draftId));
    },
    deleteDrafts: function (req, res) {
        const Model = getModel(req);
        const draftIds = req.param('draftIds');
        res.halt(Model.deleteDrafts(Model, draftIds));
    },
    setAuthorshipPrivacy: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.params.documentId;
        const AuthorshipModel = getAuthorshipModel(req);
        const privacy = req.body.privacy;
        res.halt(AuthorshipModel.setPrivacy(documentId, researchEntityId, privacy));
    },
    setAuthorshipFavorite: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.params.documentId;
        const AuthorshipModel = getAuthorshipModel(req);
        const favorite = req.body.favorite;
        res.halt(AuthorshipModel.setFavorite(documentId, researchEntityId, favorite));
    },
    setDocumentsAsNotDuplicate: function (req, res) {
        const researchEntityId = req.params.researchEntityId;
        const documentId = req.params.documentId;
        const duplicateIds = req.body.duplicateIds;
        const Model = getModel(req);
        res.halt(Model.setDocumentsAsNotDuplicate(Model, researchEntityId, documentId, duplicateIds));
    },
    removeVerify: function (req, res) {
        const researchEntityId = parseInt(req.params.researchEntityId, 10);
        const document1Id = req.body.document1Id;
        const document2Id = req.body.document2Id;
        const verificationData = Authorship.filterFields(req.body);
        verificationData.affiliationInstituteIds = req.body.affiliations;
        const Model = getModel(req);
        res.halt(Model.removeVerify(Model, researchEntityId, document1Id, verificationData, document2Id));
    },
    replace: function (req, res) {
        const researchEntityId = parseInt(req.params.researchEntityId, 10);
        const documentId = req.body.documentId;
        const documentToBeReplacedId = req.body.documentToBeReplacedId;
        const Model = getModel(req);
        res.halt(Model.replace(Model, researchEntityId, documentId, documentToBeReplacedId));
    },
    getPublicDocuments: async (req, res) => makePublicAPIrequest(req, res, 'documents'),
    getPublications: async (req, res) => makePublicAPIrequest(req, res, 'publications'),
    getDisseminationTalks: async (req, res) => makePublicAPIrequest(req, res, 'disseminationTalks'),
    getScientificTalks: async (req, res) => makePublicAPIrequest(req, res, 'scientificTalks'),
    getHighImpactPublications: async (req, res) => makePublicAPIrequest(req, res, 'highImpactPublications'),
    getFavoritePublications: async (req, res) => makePublicAPIrequest(req, res, 'favoritePublications'),
    getOralPresentations: async (req, res) => makePublicAPIrequest(req, res, 'oralPresentations'),
    getAccomplishments: async (req, res) => makePublicAPIrequest(req, res, 'accomplishments'),
    getPublicProfile: async (req, res) => makePublicAPIrequest(req, res, 'userData')
};

function makePublicAPIrequest(req, res, attribute) {
    const researchEntityModel = getModel(req);
    const searchKey = Object.keys(req.params)[0];
    const searchCriteria = {
        [searchKey]: req.params[searchKey]
    };
    const baseUrl = `http://localhost:${sails.config.port}`;
    res.halt(researchEntityModel.makeInternalRequest(researchEntityModel, searchCriteria, baseUrl, req.query, attribute));
}

function getModel(req) {
    const model_name = req.options.model || req.options.controller;
    return req._sails.models[model_name];
}

function getAuthorshipModel(req) {
    const Model = getModel(req);
    return Model.getAuthorshipModel();
}