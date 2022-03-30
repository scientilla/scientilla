'use strict'

module.exports = function (roles) {
    return function (req, res, next) {
        waterlock.validator.validateTokenRequest(req, function (err, user) {
            if (err) {
                return res.forbidden(err);
            }

            if (_.isEmpty(roles)) {
                return res.serverError('No roles specified!');
            }

            if (!roles.includes(user.role)){
                sails.log.debug('access forbidden ' + req.path);
                return res.forbidden(err);
            }

            // valid request
            next();
        });
    };
}
