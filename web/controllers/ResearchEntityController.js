const queryString2SequelizeParameters = require('../services/queryString2SequelizeParameters');

module.exports = {
    getVerifiedDocuments: async (req, res) => {
        const researchEntityId = req.params.researchEntityId;
        const researchEntity = await User.findById(researchEntityId);
        if (!researchEntity) {
            res.status(404).send("");
            return;
        }
        const sequelizeParameters = queryString2SequelizeParameters(req.query, Document);
        const documents = await researchEntity.getDocuments(sequelizeParameters);
        res.json({count: documents.length, items: documents});
    }
};