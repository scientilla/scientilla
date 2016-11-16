/* global Document */

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing Documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getSuggestedCollaborators: function (req, res) {
        var documentId = req.params.id;
        Document
            .getSuggestedCollaborators(documentId)
            .then(function (suggestion) {
                res.json(suggestion);
            });
    },
    deleteDrafts: function (req, res) {
        var draftIds = req.param('draftIds');
        res.halt(Document.deleteDrafts(draftIds));
    }
};

