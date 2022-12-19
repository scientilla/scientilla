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
    },
    async getActions(req, res) {
        const results = await SqlService.query('SELECT DISTINCT project_type_2 FROM project WHERE project_type_2 IS NOT NULL ORDER BY project_type_2 ASC');
        const actions = results.map(r => r.project_type_2);
        res.halt(Promise.resolve(actions));
    }
};
