/* global Project*/

module.exports = {
    async generateGroup(req, res) {
        const projectId = +req.params.projectId;
        const administratorIds = Array.isArray(req.body.administratorIds) ? req.body.administratorIds : [req.body.administratorIds];
        res.halt(Project.generateGroup(projectId, administratorIds));
    },
    async export(req, res) {
        const projectIds = Array.isArray(req.body.projectIds) ? req.body.projectIds : [req.body.projectIds];
        const format = req.body.format;

        res.halt(Project.export(projectIds, format), {dataType: 'file'});
    }

};
