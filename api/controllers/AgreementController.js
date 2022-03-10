/* global ResearchItemTypes */

module.exports = {
    getUniquePartnerInstitutes(req, res, next) {
        res.halt(ResearchItemProjectAgreement.getUniquePartnerInstitutes());
    },
    async export(req, res) {
        let projectIds = req.body.projectIds;
        const format = req.body.format;

        if (!Array.isArray(projectIds))
        projectIds = [projectIds];

        res.halt(Project.export(projectIds, format, ResearchItemTypes.PROJECT_AGREEMENT), {dataType: 'file'});
    }
};
