/* global Patent, Exporter */

module.exports = {
    async export(req, res) {
        const patentIds = Array.isArray(req.body.patentIds) ? req.body.patentIds : [req.body.patentIds];
        const format = req.body.format;


        Exporter.exportDownload(Patent, res, patentIds, format);
    }
};