'user strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, function (err, user) {
        if (err) {
            return res.forbidden(err);
        }

        if (!['superuser', 'administrator'].includes(user.role)){
            sails.log.debug('access forbidden ' + req.path);
            return res.forbidden(err);
        }
        // valid request
        next();
    });
};
