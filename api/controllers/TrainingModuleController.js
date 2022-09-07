/* global TrainingModule */

module.exports = {
    async export(req, res) {
        let trainingModuleIds = req.body.trainingModuleIds;
        const format = req.body.format;

        if (!Array.isArray(trainingModuleIds))
            trainingModuleIds = [trainingModuleIds];

        res.halt(TrainingModule.export(trainingModuleIds, format), {dataType: 'file'});
    }

};