/**
 * ResearchEntityController
 *
 * @description :: Server-side logic for managing Researchentities
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getReferences: function (req, res) {
        var userId = req.params.userId;
        var populate = req.query.populate;
        if (_.isString(populate))
            populate = [populate];
        var filter = req.query.filter || 'all';
        var model = req.options.model || req.options.controller;
        if (!_.contains(['group', 'user'], model))
            return res.err('error');
        var Model = req._sails.models[model];
        Model.getReferences(Model, userId, populate, filter)
                .then(function (references) {
                    res.json(references);
                });
    }
};

