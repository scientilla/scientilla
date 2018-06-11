/* global sails */
'use strict';

module.exports = function halt(promise, options) {
    const res = this.res;

    let dataType = 'json';
    if (options && options.dataType)
        dataType = options.dataType;

    const fileFn = data => {
        res.set('Content-Type', 'application/octet-stream');
        return res.send(data);
    };

    promise.then(data => {
        if (dataType === 'json')
            return res.json(data);
        if (dataType === 'file')
            return fileFn(data);
    }).catch(err => {
        sails.log.debug(err);
        res.badRequest(err);
    });
};
