module.exports = {
    async export(req, res) {
        let accomplishmentIds = req.body.accomplishmentIds;
        const format = req.body.format;

        if (!Array.isArray(accomplishmentIds))
            accomplishmentIds = [accomplishmentIds];

        res.halt(Accomplishment.export(accomplishmentIds, format), {dataType: 'file'});
    }

};