/* global GeneralSettings */

module.exports = {
    getByName: async function (req, res) {
        const name = req.params.name;
        const result = await GeneralSettings.getSetting(name);
        res.halt(Promise.resolve(result));
    },
    saveByName: async function (req, res) {
        const name = req.params.name;
        const data = JSON.parse(req.body.data);
        const result = await GeneralSettings.setSetting(name, data);

        res.halt(Promise.resolve(result));
    },
};