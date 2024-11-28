/* global Accomplishment, Exporter */
module.exports = {
    async export(req, res) {
        const accomplishmentIds = Array.isArray(req.body.accomplishmentIds) ? req.body.accomplishmentIds : [req.body.accomplishmentIds];
        const format = req.body.format;
        Exporter.exportDownload(Accomplishment, res, accomplishmentIds, format);
    }

};