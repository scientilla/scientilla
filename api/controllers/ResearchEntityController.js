/* global Connector, sails */

/**
 * ResearchEntityController
 *
 * @description :: Server-side logic for managing Researchentities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */


var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

module.exports = {
    createDraft: function (req, res) {
        var researchEntityId = req.params.researchEntityId;
        var draftData = req.body;
        var Model = getModel(req);
        return res.halt(Model.createDraft(Model, researchEntityId, draftData));
    },
    getReferences: function (req, res) {
        var researchEntity = req.params.id;
        var populate = getPopulateFields(req);
        var filter = req.query.filter || 'all';
        var model = req.options.model || req.options.controller;
        if (!_.contains(['group', 'user'], model))
            return res.err('error');
        var Model = req._sails.models[model];
        Model.getReferences(Model, researchEntity, populate, filter)
                .then(function (references) {
                    res.json(references);
                });
    },
    unverifyDocument: function (req, res) {
        var researcEntityId = req.params.id;
        var referenceId = req.params.referenceId;
        var Model = getModel(req);
        res.halt(Model.unverifyDocument(Model, researcEntityId, referenceId));
    },
    verifyDraft: function (req, res) {
        var researchEntityId = req.params.id;
        var draftId = req.params.draftId;
        var position = req.body.position;
        var affiliationInstituteIds = req.body.affiliations;
        var Model = getModel(req);
        res.halt(Model.verifyDraft(Model, researchEntityId, draftId, position, affiliationInstituteIds));
    },
    verifyDrafts: function (req, res) {
        var researchEntityId = req.params.id;
        var draftIds = req.param('draftIds');
        var Model = getModel(req);
        res.halt(Model.verifyDrafts(Model, researchEntityId, draftIds));
    },
    verifyDocument: function (req, res) {
        var researchEntityId = req.params.id;
        var documentId = req.body.id;
        var position = req.body.position;
        var affiliationInstituteIds = req.body.affiliations;
        var Model = getModel(req);
        // TODO in case of failed verify give response with details instead of 400
        res.halt(Model.verifyDocument(researchEntityId, documentId, position, affiliationInstituteIds));
    },
    verifyDocuments: function (req, res) {
        var researchEntityId = req.params.id;
        var documentIds = req.param('documentIds');
        var Model = getModel(req);
        res.halt(Model.verifyDocuments(Model, researchEntityId, documentIds));
    },
    discardDocument: function (req, res) {
        var researchEntityId = req.params.id;
        var documentId = req.param('documentId');
        var Model = getModel(req);
        res.halt(Model.discardDocument(researchEntityId, documentId));
    },
    discardDocuments: function (req, res) {
        var researchEntityId = req.params.id;
        var documentIds = req.param('documentIds');
        var Model = getModel(req);
        res.halt(Model.discardDocuments(Model, researchEntityId, documentIds));
    },
    createDrafts: function (req, res) {
        var researchEntityId = req.params.id;
        var documents = req.param('documents');
        var Model = getModel(req);
        res.halt(Model.createDrafts(Model, researchEntityId, documents));
    },
    getExternalDocuments: function (req, res) {
        var researchEntityId = req.params.id;
        var query = getQuery(req);
        var Model = getModel(req);
        res.halt(Connector.getDocuments(Model, researchEntityId, query));
    }
};

function getModel(req) {
    var model_name = req.options.model || req.options.controller;
    var Model = req._sails.models[model_name];
    return Model;
}

function getPopulateFields(req) {
    var populate = req.query.populate;
    if (_.isString(populate))
        populate = [populate];
    return populate;
}

function getQuery(req) {
    var query = {
        limit: actionUtil.parseLimit(req),
        skip: actionUtil.parseSkip(req),
        where: JSON.parse(req.query.where || '{}')
    };
    return query;
}

