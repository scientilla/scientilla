/* global GeneralSettings */

module.exports = {
  findOrCreate: async name => {
    let setting = await GeneralSettings.findOne({name});

    if (!setting) {
      setting = await GeneralSettings.create({name, data: {}});
    }

    return setting;
  },
  save: async (name, data) => {
    await GeneralSettings.update({name}, {data});

    return await GeneralSettings.findOne({name});
  }
};

