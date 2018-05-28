module.exports = {
    'get /api/v1/users/:researchEntityId/documents': 'ResearchEntityController.getVerifiedDocuments',
    'all /*': 'OldController.relay'
};