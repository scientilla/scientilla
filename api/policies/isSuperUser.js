'user strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, function (err, user) {
        if (err) {
            return res.forbidden(err);
        }
        if (user.role !== 'superuser'){
            sails.log.debug('access forbidden ' + req.path);
            return res.forbidden(err);
        }
        // valid request
        next();
    });
};