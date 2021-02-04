module.exports = {
    async export(req, res) {
        let patentIds = req.body.patentIds;
        const format = req.body.format;

        if (!Array.isArray(patentIds))
            patentIds = [patentIds];

        res.halt(Patent.export(patentIds, format), {dataType: 'file'});
    }

};