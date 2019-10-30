module.exports = {
    getTasks: async function (req, res) {
        const result = await Log.getTasks();
        res.halt(Promise.resolve(result));
    },
    read: async function (req, res) {
        const result = await Log.read(req);
        res.halt(Promise.resolve(result));
    },
};