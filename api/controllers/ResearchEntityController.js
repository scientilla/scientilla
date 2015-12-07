/**
 * ResearchEntityController
 *
 * @description :: Server-side logic for managing Researchentities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getReferences: function (req, res) {
        var researchEntity = req.params.id;
        var populate = req.query.populate;
        if (_.isString(populate))
            populate = [populate];
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
        Model.deleteReference(referenceId).then(function (r) {
            res.json();
        });
    },
    verifyDraft: function (req, res) {
        var referenceId = req.params.id;
        var Model = getModel(req);
        Model
                .verifyDraft(referenceId)
                .then(function (reference) {
                    res.json(reference);
                });
    },
    verifyReference: function(req, res) {
        var researchEntityId = req.params.id;
        var referenceId = req.params.options.values.id;
        var Model = getModel(req);
        Model
                .verifyReference(researchEntityId, referenceId)
                .then(function (reference) {
                    res.json(reference);
                });
    }
};

function getModel(req) {
    var model = req.options.model || req.options.controller;
    var Model = req._sails.models[model];
    return Model;
}

