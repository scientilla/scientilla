module.exports = {
    getMetrics: async function (req, res) {
        const result = await SourceMetrics.getMetrics(req);
        res.halt(Promise.resolve(result));
    },
    importMetrics: async function (req, res) {
        const result = await SourceMetrics.importMetrics(req);
        res.halt(Promise.resolve(result));
    },
    assignMetrics: async function (req, res) {
        const result = await SourceMetrics.assignMetrics(req);
        res.halt(Promise.resolve(result));
    }
};