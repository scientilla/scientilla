const queryString2SequelizeParameters = require('../services/queryString2SequelizeParameters');

module.exports = {
    getVerifiedDocuments: async (req, res) => {
        const researchEntityId = req.params.researchEntityId;
        const researchEntity = await User.findById(researchEntityId);
        const sequelizeParameters = queryString2SequelizeParameters(req.query);
        sequelizeParameters.order = Document.orderBy;
        const documents = await researchEntity.getDocuments(sequelizeParameters);
        res.json(documents);
    }
};