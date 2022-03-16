/* global GeneralSetting */

module.exports = {
  findOrCreate: async name => {
    let setting = await GeneralSetting.findOne({name});

    if (!setting) {
      setting = await GeneralSetting.create({name, data: {}});
    }

    return setting;
  },
  save: async (name, data) => {
    await GeneralSetting.update({name}, {data});

    return await GeneralSetting.findOne({name});
  }
};

