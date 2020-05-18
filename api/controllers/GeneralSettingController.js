/* global RoleAssociations */

module.exports = {
    getByName: async function (req, res) {
        const name = req.params.name;
        const result = await GeneralSetting.findOne({ name: name });
        res.halt(Promise.resolve(result));
    },
    saveByName: async function (req, res) {
        const name = req.params.name;
        const data = JSON.parse(req.body.data);
        const result = await GeneralSetting.update({ name: name }, { data: data });

        if (name === 'role-associations') {
            RoleAssociations.init();
        }

        res.halt(Promise.resolve(result));
    },
};