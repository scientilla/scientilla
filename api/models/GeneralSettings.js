/* global GeneralSettings, RoleAssociations */

module.exports = {
    attributes: {
        name: 'STRING',
        data: 'JSON',
    },
    tableName: 'general_settings',
    async setSetting(name, data) {
        const currentSettings = await GeneralSettings.findOne({name});

        if (currentSettings)
            await GeneralSettings.update({name}, {data});
        else
            await GeneralSettings.create({name, data});

        if (name === 'role-associations')
            RoleAssociations.init();

        return this.getSetting(name);
    },
    async getSetting(name) {
        return await GeneralSettings.findOne({name});
    }
};