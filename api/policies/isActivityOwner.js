'use strict'

module.exports = function (req, res, next) {
    waterlock.validator.validateTokenRequest(req, function (err, user) {
        if (err) {
            return res.forbidden(err);
        }

        const userId = +req.params.researchEntityId || req.params.id;
        if (userId !== user.id && user.role != 'administrator'){
            sails.log.debug('access forbidden ' + req.path);
            return res.forbidden(err);
        }

        // valid request
        next();
    });
};
