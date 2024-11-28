/* global sails */
'use strict';
const fs = require('fs');

module.exports = function halt(promise, options) {
    const res = this.res;

    let dataType = 'json';
    if (options && options.dataType)
        dataType = options.dataType;

    const fileFn = data => {
        res.set('Content-Type', 'application/octet-stream');
        return res.send(data);
    };
    const excelFn = buffer => {
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename="file.xlsx"',
            'Content-Length': buffer.length,
            'Content-Encoding': 'identity',
        });
        return res.end(buffer);
    };

    Promise.resolve(promise).then(data => {
        if (dataType === 'json')
            return res.json(data);
        if (dataType === 'file')
            return fileFn(data);
        if (dataType === 'excel')
            return excelFn(data);
    }).catch(err => {
        sails.log.debug(err);
        res.badRequest(err);
    });
};
