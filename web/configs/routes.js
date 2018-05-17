module.exports = {
    'put /api/v1/users/:researchEntityId/drafts/:draftId/verified': 'ResearchEntityController.verifyDraft',
    'all /*': 'OldController.relay'
};