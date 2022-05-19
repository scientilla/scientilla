module.exports = {
    get: async function (req, res) {
        let name = false;
        if (_.has(req, 'params.name')) {
            name = req.params.name;
        }
        const result = await AccessLog.get(name);
        res.halt(Promise.resolve(result));
    },
    download: async function (req, res) {
        const name = req.body.name;
        try {
            const download = await AccessLog.download(name);
            download.pipe(res, {end: true});
        } catch (err) {
            res.halt(Promise.reject(err));
        }
    }
};
