module.exports = {
    getUniquePartnerInstitutes(req, res, next) {
        res.halt(ResearchItemProjectAgreement.getUniquePartnerInstitutes());
    }
};
