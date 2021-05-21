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

        switch (name) {
            case 'cid-associations':
                await handleCIDAssociations(data);
            default:
                break;
        }

        res.halt(Promise.resolve(result));
    },
};

async function handleCIDAssociations(data) {
    await data.forEach(async association => {
        const user = await User.findOne({username: association.email});
        if (user.cid !== association.cid) {
            await User.update({id: user.id}, {cid: association.cid});
        }
    });
}