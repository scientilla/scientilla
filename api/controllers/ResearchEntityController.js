/**
 * ResearchEntityController
 *
 * @description :: Server-side logic for managing Researchentities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
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
    deleteReference: function (req, res) {
        var researcEntityId = req.params.id;
        var referenceId = req.params.referenceId;
        var Model = getModel(req);
        Model
                .deleteReference(Model, researcEntityId, referenceId)
                .then(function (r) {
                    res.json();
                });
    },
    verifyDraft: function (req, res) {
        var researchEntityId = req.params.id;
        var referenceId = req.params.referenceId;
        var Model = getModel(req);
        res.halt(Model.verifyDraft(researchEntityId, referenceId));
    },
    verifyReference: function (req, res) {
        var researchEntityId = req.params.id;
        var referenceId = req.params.options.values.id;
        var Model = getModel(req);
        Model
                .verifyReference(researchEntityId, referenceId)
                .then(function (reference) {
                    res.json(reference);
                });
    },
    getOne: function (req, res) {
        var researchEntityId = req.params.id;
        var populate = getPopulateFields(req);
        var Model = getModel(req);
        Model.getOne(Model, researchEntityId, populate)
                .then(function (researchEntity) {
                    res.json(researchEntity);
                });
    },
    getExternalReferences: function (req, res) {
        var researchEntityId = req.params.id;
        var connector = req.query.connector;
        var Model = getModel(req);
        if (!connector) {
            sails.log.debug('No Connector');
            res.badRequest('A Connector parameter is necessary');
            return;
        }
        res.halt(Connector.getReferences(Model, researchEntityId, connector));
    }
};

function getModel(req) {
    var model = req.options.model || req.options.controller;
    var Model = req._sails.models[model];
    return Model;
}

function getPopulateFields(req) {
    var populate = req.query.populate;
    if (_.isString(populate))
        populate = [populate];
    return populate;
}

