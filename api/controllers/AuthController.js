/**
 * AuthController
 *
 * @module      :: Controller
 * @description	:: Provides the base authentication
 *                 actions used to make waterlock work.
 *
 * @docs        :: http://waterlock.ninja/documentation
 */

module.exports = require('waterlock').waterlocked({

  register: function(req, res) {
      var params = waterlock._utils.allParams(req);
      User.createCompleteUser(params)
          .then(function(user) {
              waterlock.cycle.loginSuccess(req, res, user);
          })
          .catch(function(err) {
              sails.log.error(err);
              res.json(err);
          })
  }

});
