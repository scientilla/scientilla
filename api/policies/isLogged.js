'use strict';
/* jshint unused:false */

/**
 * hasJsonWebToken
 *
 * @module      :: Policy
 * @description :: Assumes that your request has an jwt;
 *
 * @docs        :: http://waterlock.ninja/documentation
 */
module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, function (err, user) {
        if (err) {
            sails.log.debug('access forbidden ' + req.path);
            return res.forbidden(err);
        }

        // valid request
        next();
    });
};
