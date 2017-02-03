/**
 * SettingsController
 *
 * @description :: Server-side logic for managing Settings
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
    getSettings: function (req, res) {
        return Settings.getSettings()
            .then(settings => res.json(settings))
            .catch(function (err) {
                sails.log.debug(err);
                res.badRequest(err);
            });
    }
};

