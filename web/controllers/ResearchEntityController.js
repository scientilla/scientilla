module.exports = {
    verifyDraft: (req, res) => {
        const researchEntityId = req.params.researchEntityId;
        const draftId = req.params.draftId;
        const verificationData = req.body;
        //const Model = getModel(req);
        //res.halt(Model.verifyDraft(Model, researchEntityId, draftId, verificationData));
    }
};