/* global ResearchEntity, ResearchItem, Verify */


module.exports = {
    createDraft(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const draftData = req.body;
        res.halt(ResearchItem.createDraft(researchEntityId, draftData));
    },
    updateDraft(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const draftId = +req.params.itemId;
        const draftData = req.body;
        res.halt(ResearchItem.updateDraft(researchEntityId, draftId, draftData));
    },
    deleteDraft(req, res, next) {
        const draftId = +req.params.itemId;
        res.halt(ResearchItem.deleteDraft(draftId));
    },
    deleteDrafts(req, res, next) {
        const draftIds = req.param('draftIds');
        res.halt(ResearchItem.blukAction(ResearchItem.deleteDraft, draftIds));
    },
    verify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        const verificationData = req.body;
        res.halt(Verify.verify(researchEntityId, itemId, verificationData));
    },
    unverify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        res.halt(Verify.unverify(researchEntityId, itemId));
    },
    setPublic(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const researchItemId = +req.params.itemId;
        const publicFlag = req.body.public;
        res.halt(Verify.setPublic(researchEntityId, researchItemId, publicFlag));
    },
    setFavorite(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const researchItemId = +req.params.itemId;
        const favorite = req.body.favorite;
        res.halt(Verify.setFavorite(researchEntityId, researchItemId, favorite));
    },
    copyResearchItem(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        const researchItemId = req.param('researchItemId');
        res.halt(ResearchItem.copyResearchItem(researchItemId, researchEntityId));
    },
    copyResearchItems(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        const researchItemIds = req.param('researchItemIds');
        res.halt(ResearchItem.blukAction(ResearchItem.copyResearchItems, researchItemIds, [researchEntityId]));
    },
};
