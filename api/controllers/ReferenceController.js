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
    verifyDraft: function (req, res) {
        var referenceId = req.params.id;
        Reference
                .verifyDraft(referenceId)
                .then(function (reference) {
                    res.json(reference);
                });
    }
};

