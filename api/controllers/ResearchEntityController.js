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
    setResearchItemAuthors(req, res, next){
        const draftId = +req.params.itemId;
        const authorsData = req.body;
        res.halt(ResearchItem.setResearchItemAuthors(draftId, authorsData));
    },
    verify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        const verificationData = req.body;
        res.halt(Verify.verify(itemId, researchEntityId, verificationData));
    },
    multipleVerify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemIds = req.param('itemIds');
        res.halt(ResearchItem.blukAction(Verify.verify, itemIds, [researchEntityId]));
    },
    unverify(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        res.halt(Verify.unverify(researchEntityId, itemId));
    },
    discard(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemId = +req.params.itemId;
        res.halt(ResearchEntity.discardResearchItem(itemId, researchEntityId));
    },
    multipleDiscard(req, res, next) {
        const researchEntityId = +req.params.researchEntityId;
        const itemIds = req.param('itemIds');
        res.halt(ResearchEntity.blukAction(ResearchEntity.discardResearchItem, itemIds, [researchEntityId]));
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
        const researchItemIds = req.param('itemIds');
        res.halt(ResearchItem.blukAction(ResearchItem.copyResearchItem, researchItemIds, [researchEntityId]));
    },
    // todo add policies
    getProfile(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        res.halt(ResearchEntityData.getProfile(researchEntityId));
    },
    // todo add policies
    getEditProfile(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        res.halt(ResearchEntityData.getEditProfile(researchEntityId));
    },
    saveProfile(req, res, next) {
        const researchEntityId = req.params.researchEntityId;
        const profile = req.body;
        res.halt(ResearchEntityData.saveProfile(researchEntityId, profile));
    }
};
