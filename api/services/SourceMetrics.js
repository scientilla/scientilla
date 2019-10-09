// SourceMetrics.js - in api/services
/* global SqlService */

"use strict";

const _ = require('lodash');
const path = require('path');

const baseFolder = path.join('config', 'init');

const sqlQueries = {
    'import': 'api/queries/sourceMetricsByOriginAndYear.sql',
    'assign': 'api/queries/assignedSourceMetrics.sql'
};

module.exports = {
    getMetrics,
    importMetrics,
    assignMetrics
};

async function getMetrics(req) {
    const type = req.params.type;

    if (type && sqlQueries[type]) {
        const sql = SqlService.readQueryFromFs(sqlQueries[type]);
        return await SqlService.query(sql);
    }

    return {
        type: 'failed'
    };
}

async function importMetrics(req) {
    return new Promise(function (resolve, reject) {
        const filename = req.file('file')._files[0].stream.filename;
        req.file('file').upload({
            maxBytes: 10000000000000,
            saveAs: filename,
            dirname: path.resolve(sails.config.appPath, baseFolder)
        }, async function (err, file) {
            if (err) {
                reject('Failed to upload the source metrics file!');
            }

            GruntTaskRunner.run('import:sourcesMetrics:' + filename);

            resolve('The import has been started!');
        });
    }).then(result => {
        return {
            type: 'success',
            message: result
        };
    }).catch(err => {
        return {
            type: 'failed',
            message: err
        };
    });
}

async function assignMetrics(req) {
    return new Promise(async function (resolve) {
        const year = req.body.year;
        const yearRegex = /^(19|20)\d{2}$/;
        if (!yearRegex.test(year)) {
            GruntTaskRunner.run('documents:assignMetrics');
        } else {
            GruntTaskRunner.run('documents:assignMetrics:' + year);
        }

        resolve('The assigning has been started!');
    }).then(message => {
        return {
            type: 'success',
            message: message
        };
    }).catch(err => {
        return {
            type: 'failed',
            message: err
        };
    });
}