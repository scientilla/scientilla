/* global ResearchItemTypes, Project, Exporter */

module.exports = {
    getUniquePartnerInstitutes(req, res, next) {
        res.halt(ResearchItemProjectAgreement.getUniquePartnerInstitutes());
    },
    async export(req, res) {
        let projectIds = Array.isArray(req.body.projectIds) ? req.body.projectIds : [req.body.projectIds];
        const format = req.body.format;

        Exporter.exportDownload(Project, res, projectIds, format);
    },
};
