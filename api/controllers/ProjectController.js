module.exports = {
    async export(req, res) {
        let projectIds = req.body.projectIds;
        const format = req.body.format;

        if (!Array.isArray(projectIds))
            projectIds = [projectIds];

        res.halt(Project.export(projectIds, format), {dataType: 'file'});
    }

};