/* global TrainingModule, Exporter */

module.exports = {
    async export(req, res) {
        let trainingModuleIds = Array.isArray(req.body.trainingModuleIds) ? req.body.trainingModuleIds : [req.body.trainingModuleIds];
        const format = req.body.format;

        Exporter.exportDownload(TrainingModule, res, trainingModuleIds, format);
    },
};