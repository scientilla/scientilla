/* global GeneralSetting, RoleAssociations */

module.exports = {
    attributes: {
        name: 'STRING',
        data: 'JSON',
    },
    tableName: 'general_settings',
    async setSetting(name, data) {
        const currentSettings = await GeneralSetting.findOne({name});

        if (currentSettings)
            await GeneralSetting.update({name}, {data});
        else
            await GeneralSetting.create({name, data});

        if (name === 'role-associations')
            RoleAssociations.init();

        return this.getSetting(name);
    },
    async getSetting(name) {
        return await GeneralSetting.findOne({name});
    }
};
