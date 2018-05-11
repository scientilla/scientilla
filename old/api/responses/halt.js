/* global sails */
'use strict';

module.exports = function halt(promise, options) {
    const res = this.res;
    
    promise.then(data => res.json(data))
            .catch(err => {
                sails.log.debug(err);
                res.badRequest(err);
            });
};

