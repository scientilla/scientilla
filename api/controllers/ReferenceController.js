/* global Reference */

/**
 * ReferenceController
 *
 * @description :: Server-side logic for managing References
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getSuggestedCollaborators: function (req, res) {
        var referenceId = req.params.id;
        Reference
                .getSuggestedCollaborators(referenceId)
                .then(function (suggestion) {
                    res.json(suggestion);
                });
    },
    deleteDrafts: function (req, res) {
        var draftIds = req.param('draftIds');
        res.halt(Reference.deleteDrafts(draftIds));
    }
};

