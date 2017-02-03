/**
 * Settings.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

    attributes: {},
    getSettings: function () {
        const settings = {
            registerEnabled: sails.config.scientilla.registerEnabled
        };
        return Promise.resolve(settings);
    }
};

