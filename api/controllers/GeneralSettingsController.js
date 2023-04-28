/* global GeneralSetting */

module.exports = {
    getByName: async function (req, res) {
        const name = req.params.name;
        const result = await GeneralSetting.getSetting(name);
        res.halt(Promise.resolve(result));
    },
    saveByName: async function (req, res) {
        const name = req.params.name;
        const data = JSON.parse(req.body.data);
        const result = await GeneralSetting.setSetting(name, data);

        switch (name) {
            case 'cid-associations':
                await handleCIDAssociations(data);
            case 'role-associations':
                await SqlService.refreshMaterializedView('person');
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
