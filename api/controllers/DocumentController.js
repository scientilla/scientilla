/* global Document */

/**
 * DocumentController
 *
 * @description :: Server-side logic for managing Documents
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    synchronizeDraft: async function (req, res) {
        const draftId = req.params.draftId;
        const draft = await Document.findOneById(draftId);
        const synchronized = req.body.synchronized;
        res.halt(draft.scopusSynchronize(synchronized));
    },
    desynchronizeDrafts: async function (req, res) {
        const drafts = req.body.drafts;
        res.halt(Document.desynchronizeAll(drafts));
    },
};

